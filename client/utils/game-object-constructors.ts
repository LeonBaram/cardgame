import type { ScryfallCardData } from "../../models";

const scryfallAPI = "https://api.scryfall.com";

export async function fetchScryfallCardData(
  cardName: string
): Promise<ScryfallCardData> {
  const response = await fetch(`${scryfallAPI}/cards/named?fuzzy=${cardName}`);
  const cardData = await response.json();
  if (!cardData) {
    throw `Scryfall has no cards with name similar to ${cardName}`;
  }
  return cardData;
}
