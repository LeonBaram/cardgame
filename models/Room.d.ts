import { Player } from "./Player";

export type Room = {
  id: string;
  players: Map<string, Player>;
};
