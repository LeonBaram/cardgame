import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectType = "Card" | "Deck" | "Counter";

type GameObject = {
  readonly sprite: Phaser.GameObjects.Image;
  readonly data: any;
};

export type Card = GameObject & {
  readonly data: ScryfallCardData;
};

export type Deck = GameObject & {
  readonly data: ScryfallCardData[];
};

export type Counter = GameObject & {
  readonly data: number;
};
