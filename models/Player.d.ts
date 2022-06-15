import type { WebSocket } from "ws";

export type Player = {
  roomID: string;
  socket: WebSocket;
};
