import { LRU } from "./LRU";

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

type ApiFetcher = (s: string) => Promise<ScryfallCardData | ApiError>;

type Name = string;
type ID = string;
const searches = new LRU<Name, ID | null>(600);
const results = new LRU<ID, ScryfallCardData>(600);

export const scryfallFetchByName: ApiFetcher = async (name) => {
  const id = searches.get(name);
  switch (id) {
    case undefined:
      // no cached search results
      break;
    case null:
      // search 404'd
      return defaultError;
    default:
      // search was success
      return scryfallFetchByID(id);
  }

  const res = await fetch(`${scryfallAPI}/cards/named?fuzzy=${name}`);
  const data: ScryfallCardData | ApiError = await res.json();

  if (data.object !== "error") {
    const { id } = data;
    searches.set(name, id);
    results.set(id, data);
  } else {
    searches.set(name, null);
  }

  return data;
};

export const scryfallFetchByID: ApiFetcher = async (id) => {
  const data = results.get(id);
  if (data) {
    return data;
  } else {
    const res = await fetch(`${scryfallAPI}/cards/${id}`);
    const data: ScryfallCardData | ApiError = await res.json();

    if (data.object !== "error") {
      const { id } = data;
      results.set(id, data);
    }

    return data;
  }
};
