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

const cachedData = {
  // cache API requests - avoid sending identical repeats
  requests: new LRU_Cache<string, Promise<Response>>(1000),

  // cache card data by fuzzy card name
  cardNames: new LRU_Cache<string, ScryfallResponse>(1000),

  // cache card data by card ID
  cardIDs: new LRU_Cache<string, ScryfallResponse>(1000),
}

const cachedFetch: ApiFetcher = async (url) => {
  const { requests } = cachedData;

  if (!requests.has(url)) {
    requests.set(url, fetch(url, { cache: 'force-cache' }));
  }

  const res = await requests.get(url);
  return await res.clone().json();
}

export const fetchByName: ApiFetcher = async (name) => {
  const { cardNames, cardIDs } = cachedData;

  if (!cardNames.has(name)) {
    const data = await cachedFetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);
    cardNames.set(name, data);

    if (data.object === 'card') {
      const { id } = data;
      cardIDs.set(id, data);
    }
  }
  return cardNames.get(name)!;
}

export const fetchByID: ApiFetcher = async (id) => {
  const { cardIDs } = cachedData;
  if (!cardIDs.has(id)) {
    cardIDs.set(id, await cachedFetch(`${scryfallAPI}/cardIDs/${id}`));
  }
  return cardIDs.get(id)!
}
