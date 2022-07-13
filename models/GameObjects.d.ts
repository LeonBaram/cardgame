import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectType = "Card" | "Deck" | "Counter";

export namespace Client {
  export type GameObjectData<T extends GameObjectType = GameObjectType> = {
    Card: { data: ScryfallCardData };
    Deck: { data: ScryfallCardData[] };
    Counter: { val: number };
  }[T];

  export type GameObject<T extends GameObjectType = GameObjectType> = {
    sprite: Phaser.GameObjects.Image;
    gameObjectType: T;
  } & GameObjectData<T>;

  export type Card = GameObject<"Card">;
  export type Deck = GameObject<"Deck">;
  export type Counter = GameObject<"Counter">;
}

export namespace Server {
  export type GameObjectData<T extends GameObjectType = GameObjectType> = {
    Card: { scryfallID: string };
    Deck: { scryfallIDs: string[] };
    Counter: { val: number };
  }[T];

  export type GameObject<T extends GameObjectType = GameObjectType> = {
    isFaceUp: boolean;
    angle: number;
    x: number;
    y: number;
    gameObjectType: T;
  } & GameObjectData<T>;

  export type Card = GameObject<"Card">;
  export type Deck = GameObject<"Deck">;
  export type Counter = GameObject<"Counter">;
}
