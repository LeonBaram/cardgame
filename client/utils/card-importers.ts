import { LRU_Cache } from "./LRU";

import type { ScryfallCardData } from "../../models";

const scryfallAPI = "https://api.scryfall.com";

export type ApiError = {
  object: "error";
  code: "not_found";
  status: 404;
  details?: string;
};

const fetchCache = new LRU_Cache<string, Promise<Response>>(1000);

const memoizedFetch = (url: string): Promise<Response> => {
  if (!fetchCache.has(url)) {
    fetchCache.set(url, fetch(url));
  }
  return fetchCache.get(url)!;
};

export type ApiFetcher = (s: string) => Promise<ScryfallCardData | ApiError>;

export const scryfallFetchByName: ApiFetcher = async (name) => {
  const res = await memoizedFetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);
  return await res.json();
};

export const scryfallFetchByID: ApiFetcher = async (id) => {
  const res = await memoizedFetch(`${scryfallAPI}/cards/${id}`);
  return await res.json();
};
