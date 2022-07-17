import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectName = "Card" | "Deck" | "Counter";

/// <reference path="Client.d.ts" />
export namespace Client {
  type GameObjectData<G extends GameObjectName> = {
    Card: { data: ScryfallCardData };
    Deck: { data: ScryfallCardData[] };
    Counter: { val: number };
  }[G];

  type GameObject<G extends GameObjectName> = GameObjectData<G> & {
    sprite: Phaser.GameObjects.Image;
    gameObjectName: G;
  };
}

/// <reference path="Server.d.ts" />
export namespace Server {
  type GameObjectData<G extends GameObjectName> = {
    Card: { scryfallID: string };
    Deck: { scryfallIDs: string[] };
    Counter: { val: number };
  }[G];

  type GameObject<G extends GameObjectName> = GameObjectData<G> & {
    gameObjectName: G;
    isFaceUp: boolean;
    angle: number;
    x: number;
    y: number;
  };
}
