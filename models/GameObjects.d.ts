import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectName = "Card" | "Deck" | "Counter";

export namespace Client {
  type CommonGameObject = {
    sprite: Phaser.GameObjects.Image;
  };

  type GameObjectData = {
    Card: { data: ScryfallCardData };
    Deck: { data: ScryfallCardData[] };
    Counter: { val: number };
  };

  type AnyGameObjectData = GameObjectData[GameObjectName];

  type GameObjects = {
    [T in GameObjectName]: CommonGameObject & GameObjectData[T];
  };

  type AnyGameObject = GameObjects[GameObjectName];
}

export namespace Server {
  type CommonGameObject = {
    gameObjectName: GameObjectName;
    isFaceUp: boolean;
    angle: number;
    x: number;
    y: number;
  };

  type GameObjectData = {
    Card: { scryfallID: string };
    Deck: { scryfallIDs: string[] };
    Counter: { val: number };
  };

  type AnyGameObjectData = GameObjectData[GameObjectName];

  type GameObjects = {
    [T in GameObjectName]: CommonGameObject & GameObjectData[T];
  };

  type AnyGameObject = GameObjects[GameObjectName];
}
