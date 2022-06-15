import { Server } from "./GameObjects";

export type Room = {
  playerIDs: Set<string>;
  hostPlayerID: string;
  gameObjects: Map<string, Server.AnyGameObject>;
};
