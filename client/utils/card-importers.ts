import { LRU_Cache } from "./LRU";

import type { ScryfallCardData } from "../../models";

const scryfallAPI = "https://api.scryfall.com";

export type ApiError = {
  object: "error";
  code: "not_found";
  status: 404;
  details?: string;
};

export type ScryfallResponse = ScryfallCardData | ApiError;
export type ApiFetcher = (s: string) => Promise<ScryfallResponse>;

const fetchCache = new LRU_Cache<string, Promise<ScryfallResponse>>(1000);

const jsonFetch: ApiFetcher = async (url) => {
  if (!fetchCache.has(url)) {
    const res = await fetch(url);
    const json: Promise<ScryfallResponse> = res.json();
    fetchCache.set(url, json);
  }
  return fetchCache.get(url)!;
};

export const scryfallFetchByName: ApiFetcher = (name) =>
  jsonFetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);

export const scryfallFetchByID: ApiFetcher = (id) =>
  jsonFetch(`${scryfallAPI}/cards/${id}`);
