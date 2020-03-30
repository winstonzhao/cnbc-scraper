import axios from "axios";
import { parse } from "node-html-parser";
import htmlToText from "html-to-text";
import { Article } from "./article";

const main = async () => {
  const params = {
    operationName: "getAssetList",
    variables: JSON.stringify({
      id: 100003241,
      offset: 35,
      pageSize: 24,
      nonFilter: true,
      includeNative: false
    }),
    extensions: JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash:
          "e5b81f1754a7faac6555b040cc61ac44f3f9d45a0a051c5c9337bd6babe6f32a"
      }
    })
  };

  const response = await axios
    .get("https://webql-redesign.cnbcfm.com/graphql", { params })
    .catch(e => console.log(e));

  if (!response) {
    return;
  }

  const articles = response.data.data.assetList.assets;

  console.log(articles);
};

const getArticleText = async url => {
  const response = await axios.get(url);
  const root = parse(response.data);
  const article: HTMLElement = (root as any).querySelector(
    ".ArticleBody-articleBody"
  );
  const text = htmlToText.fromString(article.innerHTML, {
    ignoreHref: true,
    ignoreImage: true
  });
  console.log(text);
};

main();
