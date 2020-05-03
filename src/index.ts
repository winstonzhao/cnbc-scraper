import axios from "axios";
import { parse } from "node-html-parser";
import htmlToText from "html-to-text";
import { Article, UnparsedApiParams, ParsedExtensions } from "./types";
import puppeteer from "puppeteer";
import querystring from "querystring";
import { config } from "dotenv";
import { resolve } from "path";
import { GetDbController } from "./db";

config({ path: resolve(__dirname, "../.env") });

const CNBC_URL = "https://www.cnbc.com/world-markets/";
const CNBC_API_URL = "https://webql-redesign.cnbcfm.com/graphql";

const grabShaCallback = async (res, rej) => {
  const browser = await puppeteer.launch();

  const page = (await browser.pages())[0];

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("operationName=getAssetList")) {
      const encodedParams = url.substr(CNBC_API_URL.length + 1); // + 1 for the "?"
      const params = (querystring.parse(
        encodedParams
      ) as any) as UnparsedApiParams;
      const extensions = JSON.parse(params.extensions) as ParsedExtensions;
      res(extensions.persistedQuery.sha256Hash);
      browser.close();
    }
    req.continue();
  });

  await page.goto(CNBC_URL);
  const button = await page.waitFor(".LoadMoreButton-loadMore");
  await button.click();
  await page.waitFor(5000);
  rej();
  browser.close();
};

const grabSha = () =>
  new Promise<string>((res, rej) => {
    grabShaCallback(res, rej);
  });

const fetchArticles = async (sha: string) => {
  const params = {
    operationName: "getAssetList",
    variables: JSON.stringify({
      id: 100003241,
      offset: 35,
      pageSize: 24,
      nonFilter: true,
      includeNative: false,
    }),
    extensions: JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: sha,
      },
    }),
  };

  const response = await axios
    .get(CNBC_API_URL, { params })
    .catch((e) => console.log(e));

  if (!response) {
    return;
  }

  const articles: Article[] = response.data.data.assetList.assets;
  return articles.filter(
    (a) => a.type === "wirestory" || a.type === "cnbcnewsstory"
  );
};

const getArticleText = async (url) => {
  const response = await axios.get(url);
  const root = parse(response.data);
  const article: HTMLElement = (root as any).querySelector(
    ".ArticleBody-articleBody"
  );
  const text = htmlToText.fromString(article.innerHTML, {
    ignoreHref: true,
    ignoreImage: true,
  });
  return text;
};

const main = async () => {
  const sha = await grabSha();
  console.log("Fetching articles...");
  const articles = await fetchArticles(sha);

  if (!articles) {
    console.log("No articles found...");
    return;
  }

  console.log(`Fetched ${articles.length} articles...`);

  const texts: string[] = [];

  for (let i = 0; i < articles.length; i++) {
    console.log(`Fetching text for article ${i + 1}/${articles.length}`);
    const text = await getArticleText(articles[i].url);
    texts.push(text);
    console.log(`Fetched text for article ${i + 1}/${articles.length}`);
  }
  console.log(texts);
};

main();
