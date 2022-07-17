import type { Client, Server } from "./GameObjects";

export type Room<T extends "Server" | "Client"> = {
  playerIDs: Set<string>;
  hostPlayerID: string;
  gameObjects: Map<
    string,
    T extends "Server" ? Server.GameObject : Client.GameObject
  >;
  size: number;
  isLocked: boolean;
  passwordHash: string | null;
};
