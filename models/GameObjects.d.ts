import type * as Phaser from "phaser";
import type { ScryfallCardData } from "./ScryfallCardData";

export type GameObjectTypes = "Card" | "Deck" | "Counter";

export namespace Client {
  export type CommonGameObject = {
    sprite: Phaser.GameObjects.Image;
  };

  export type GameObjectData = {
    Card: { data: ScryfallCardData };
    Deck: { data: ScryfallCardData[] };
    Counter: { val: number };
  };

  export type AnyGameObjectData = GameObjectData[GameObjectTypes];

  export type GameObjects = {
    [T in GameObjectTypes]: CommonGameObject & GameObjectData[T];
  };

  export type AnyGameObject = GameObjects[GameObjectTypes];
}

export namespace Server {
  export type CommonGameObject = {
    gameObjectType: GameObjectTypes;
    isFaceUp: boolean;
    angle: number;
    x: number;
    y: number;
  };

  export type GameObjectData = {
    Card: { scryfallID: string };
    Deck: { scryfallIDs: string[] };
    Counter: { val: number };
  };

  export type AnyGameObjectData = GameObjectData[GameObjectTypes];

  export type GameObjects = {
    [T in GameObjectTypes]: CommonGameObject & GameObjectData[T];
  };

  export type AnyGameObject = GameObjects[GameObjectTypes];
}
