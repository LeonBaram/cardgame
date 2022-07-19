import { randomUUID } from "crypto";
import * as express from "express";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import { handleEvent } from "./event-handlers";

import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import type { EventName, Events, Player, Room } from "../models";

const app = express();
app
  .use("/", express.static("dist/client/welcome"))
  .use("/rooms", express.static("dist/client/rooms"));

const httpServer = createServer(app);

const socketServer = new WebSocketServer({
  server: httpServer,
  clientTracking: true,
});

const players = new Map<string, Player>();
const rooms = new Map<string, Room<"Server">>();

socketServer.on("connection", (socket: WebSocket, req: IncomingMessage) => {
  const roomID = parseRoomID(req);
  if (roomID === null) {
    return;
  }

  const playerID = randomUUID();
  players.set(playerID, <Player>{ roomID: null, socket });

  const ctx: Events.Context<"Server"> = {
    socketServer,
    players,
    rooms,
    playerID,
    roomID,
  };

  const ok = handleEvent(ctx, { eventName: "PlayerJoined" });
  if (!ok) {
    socket.close();
  }

  console.table(rooms);
  console.table(players);

  socket.on("message", <E extends EventName>(data: Events.Data<E>) =>
    handleEvent(ctx, data)
  );

  socket.on("close", () => {
    handleEvent(ctx, { eventName: "PlayerLeft" });
    players.delete(playerID);
  });
});

httpServer.listen(process.env.PORT ?? 3000, () =>
  console.log(`listening on 3000`)
);

function parseRoomID(req: IncomingMessage): string | null {
  const { url } = req;
  if (!url) {
    return null;
  }

  const { host } = req.headers;
  if (!host) {
    return null;
  }

  const roomID = new URL(url, `http://${host}`).searchParams.get("roomID");
  if (!roomID) {
    return null;
  }

  return roomID;
}
