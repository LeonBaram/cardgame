import { GameObjectName, Server } from "./GameObjects";

export type Room = {
  playerIDs: Set<string>;
  hostPlayerID: string;
  gameObjects: Map<string, Server.GameObject<GameObjectName>>;
};
