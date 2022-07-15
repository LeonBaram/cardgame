import type { WebSocket } from "ws";

export type Player = {
  roomID: string | null;
  socket: WebSocket;
};
