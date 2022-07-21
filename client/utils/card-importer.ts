import type { ScryfallCardData } from "../../models";

const scryfallAPI = "https://api.scryfall.com";

type FetchArgs = { cardName: string } | { scryfallID: string };

export async function scryfallFetch(
  args: FetchArgs
): Promise<ScryfallCardData> {
  let res: Response;
  if ("cardName" in args) {
    res = await fetch(`${scryfallAPI}/cards/named?fuzzy=${args.cardName}`);
  } else if ("scryfallID" in args) {
    res = await fetch(`${scryfallAPI}/cards/${args.scryfallID}`);
  } else {
    throw "invalid args: must have either cardName or scryfallID";
  }

  const data = await res.json();
  const notFound = {
    object: "error",
    code: "not_found",
    status: 404,
  };

  for (const key in notFound) {
    if (key in data && data[key] === notFound[key]) {
      if ("details" in data) {
        throw data.details;
      } else {
        throw "api error: card not found";
      }
    }
  }

  return data as ScryfallCardData;
}
