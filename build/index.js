"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var node_html_parser_1 = require("node-html-parser");
var html_to_text_1 = __importDefault(require("html-to-text"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var querystring_1 = __importDefault(require("querystring"));
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.config({ path: path_1.resolve(__dirname, "../.env") });
var CNBC_URL = "https://www.cnbc.com/world-markets/";
var CNBC_API_URL = "https://webql-redesign.cnbcfm.com/graphql";
var grabShaCallback = function (res, rej) { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, button;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer_1.default.launch()];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.pages()];
            case 2:
                page = (_a.sent())[0];
                return [4 /*yield*/, page.setRequestInterception(true)];
            case 3:
                _a.sent();
                page.on("request", function (req) {
                    var url = req.url();
                    if (url.includes("operationName=getAssetList")) {
                        var encodedParams = url.substr(CNBC_API_URL.length + 1); // + 1 for the "?"
                        var params = querystring_1.default.parse(encodedParams);
                        var extensions = JSON.parse(params.extensions);
                        res(extensions.persistedQuery.sha256Hash);
                        browser.close();
                    }
                    req.continue();
                });
                return [4 /*yield*/, page.goto(CNBC_URL)];
            case 4:
                _a.sent();
                return [4 /*yield*/, page.waitFor(".LoadMoreButton-loadMore")];
            case 5:
                button = _a.sent();
                return [4 /*yield*/, button.click()];
            case 6:
                _a.sent();
                return [4 /*yield*/, page.waitFor(5000)];
            case 7:
                _a.sent();
                rej();
                browser.close();
                return [2 /*return*/];
        }
    });
}); };
var grabSha = function () {
    return new Promise(function (res, rej) {
        grabShaCallback(res, rej);
    });
};
var fetchArticles = function (sha) { return __awaiter(void 0, void 0, void 0, function () {
    var params, response, articles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
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
                            sha256Hash: sha
                        }
                    })
                };
                return [4 /*yield*/, axios_1.default
                        .get(CNBC_API_URL, { params: params })
                        .catch(function (e) { return console.log(e); })];
            case 1:
                response = _a.sent();
                if (!response) {
                    return [2 /*return*/];
                }
                articles = response.data.data.assetList.assets;
                return [2 /*return*/, articles.filter(function (a) { return a.type === "wirestory" || a.type === "cnbcnewsstory"; })];
        }
    });
}); };
var getArticleText = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var response, root, article, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                response = _a.sent();
                root = node_html_parser_1.parse(response.data);
                article = root.querySelector(".ArticleBody-articleBody");
                text = html_to_text_1.default.fromString(article.innerHTML, {
                    ignoreHref: true,
                    ignoreImage: true
                });
                return [2 /*return*/, text];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var sha, articles, texts, i, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, grabSha()];
            case 1:
                sha = _a.sent();
                console.log("Fetching articles...");
                return [4 /*yield*/, fetchArticles(sha)];
            case 2:
                articles = _a.sent();
                if (!articles) {
                    console.log("No articles found...");
                    return [2 /*return*/];
                }
                console.log("Fetched " + articles.length + " articles...");
                texts = [];
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < articles.length)) return [3 /*break*/, 6];
                console.log("Fetching text for article " + (i + 1) + "/" + articles.length);
                return [4 /*yield*/, getArticleText(articles[i].url)];
            case 4:
                text = _a.sent();
                texts.push(text);
                console.log("Fetched text for article " + (i + 1) + "/" + articles.length);
                _a.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6:
                console.log(texts);
                return [2 /*return*/];
        }
    });
}); };
var db = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.connect('mongodb://localhost', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })];
            case 1:
                _a.sent();
                console.log("meme");
                return [2 /*return*/];
        }
    });
}); };
db();
