import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectName = "Card" | "Deck" | "Counter";

export namespace Client {
  type GameObjectData<G extends GameObjectName = GameObjectName> = {
    Card: { data: ScryfallCardData };
    Deck: { data: ScryfallCardData[] };
    Counter: { val: number };
  }[G];

  type GameObject<G extends GameObjectName = GameObjectName> =
    GameObjectData<G> & {
      sprite: Phaser.GameObjects.Image;
      gameObjectName: G;
    };
}

export namespace Server {
  type GameObjectData<G extends GameObjectName = GameObjectName> = {
    Card: { scryfallID: string };
    Deck: { scryfallIDs: string[] };
    Counter: { val: number };
  }[G];

  type GameObject<G extends GameObjectName = GameObjectName> =
    GameObjectData<G> & {
      gameObjectName: G;
      isFaceUp: boolean;
      angle: number;
      x: number;
      y: number;
    };
}
