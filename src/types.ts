import { Document } from "mongoose";

export interface Article {
  id: number;
  branch: string;
  type: string;
  url: string;
  datePublished: string;
  description: string;
  title: string;
  headline: string;
}

export interface UnparsedApiParams {
  operationName: string;
  variables: string;
  extensions: string;
}

export interface ParsedExtensions {
  persistedQuery: {
    version: number;
    sha256Hash: string;
  };
}

export interface Text {
  id: string,
  title: string,
  text: string,
  date: Date,
}

export interface TextDocument extends Document {
  id: string,
  title: string,
  text: string,
  date: Date,
}

