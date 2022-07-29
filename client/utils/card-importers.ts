import { LRU_Cache } from "./LRU";

import type { ScryfallCardData } from "../../models";

const scryfallAPI = "https://api.scryfall.com";

type ApiError = {
  object: "error";
  code: "not_found";
  status: 404;
  details?: string;
};

const defaultError: ApiError = {
  object: "error",
  code: "not_found",
  status: 404,
};

export type ApiFetcher = (s: string) => Promise<ScryfallCardData | ApiError>;

type Name = string;
type ID = string;
const fuzzyNameCache = new LRU<Name, ID | null>(600);
const cardDataCache = new LRU<ID, ScryfallCardData>(600);

export const scryfallFetchByName: ApiFetcher = async (name) => {
  if (!fuzzyNameCache.has(name)) {
    const res = await fetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);
    const data: ScryfallCardData | ApiError = await res.json();

    if (data.object === "error") {
      fuzzyNameCache.set(name, null);
    } else {
      const { id } = data;
      fuzzyNameCache.set(name, id);
      cardDataCache.set(id, data);
    }
  }

  const id = fuzzyNameCache.get(name);

  if (id === null) {
    return defaultError;
  }

  return scryfallFetchByID(id!);
};

export const scryfallFetchByID: ApiFetcher = async (id) => {
  if (!cardDataCache.has(id)) {
    const res = await fetch(`${scryfallAPI}/cards/${id}`);
    const data: ScryfallCardData | ApiError = await res.json();

    if (data.object !== "error") {
      const { id } = data;
      cardDataCache.set(id, data);
    }
  }

  return cardDataCache.get(id)!;
};
