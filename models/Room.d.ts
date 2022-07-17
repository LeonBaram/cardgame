import type { Client, Server } from "./GameObjects";

export type Room = {
  playerIDs: Set<string>;
  hostPlayerID: string;
  gameObjects: Map<string, Client.GameObject | Server.GameObject>;
  size: number;
  isLocked: boolean;
  passwordHash: string | null;
};
