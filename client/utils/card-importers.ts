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

const requestCache = new LRU_Cache<string, Promise<Response>>(1000);
const dataCache = new LRU_Cache<string, ScryfallResponse>(1000);

const memoFetch = (url: string): Promise<Response> => {
  if (!requestCache.has(url)) {
    requestCache.set(url, fetch(url));
  }
  return requestCache.get(url)!;
};

const jsonFetch: ApiFetcher = async (url) => {
  if (!requestCache.has(url)) {
    requestCache.set(url, fetch(url));
  }
  if (!dataCache.has(url)) {
    const res = await requestCache.get(url)!;
    dataCache.set(url, await res.json());
  }
  return dataCache.get(url)!;
};

export const scryfallFetchByName: ApiFetcher = (name) =>
  jsonFetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);

export const scryfallFetchByID: ApiFetcher = (id) =>
  jsonFetch(`${scryfallAPI}/cards/${id}`);
