import type { Client, Server } from "./GameObjects";

export type Room<T extends "Server" | "Client" | "JSON"> = {
  playerIDs: T extends "JSON" ? string[] : Set<string>;
  hostPlayerID: string;
  gameObjects: {
    Server: Map<string, Server.GameObject>;
    Client: Map<string, Client.GameObject>;
    JSON: [string, Server.GameObject][];
  }[T];
  size: number;
  isLocked: boolean;
  passwordHash?: string;
};
