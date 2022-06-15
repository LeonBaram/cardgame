import { randomUUID } from "crypto";
import * as express from "express";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import { createEventHandlers } from "./event-handlers";

import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import type { AnyEvent, EventHandler, Player, Room } from "../models";

const app = express();
app
  .use("/", express.static("dist/client"))
  .use("/rooms", express.static("dist/client/rooms"));

const httpServer = createServer(app);

const socketServer = new WebSocketServer({
  server: httpServer,
  clientTracking: true,
});

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();
const eventHandlers = createEventHandlers({ rooms, players, socketServer });

socketServer.on("connection", (socket: WebSocket, req: IncomingMessage) => {
  const playerID = randomUUID();
  const roomID = new URL(
    req.url!,
    `http://${req.headers.host}`
  ).searchParams.get("roomID")!;
  players.set(playerID, <Player>{ roomID, socket });
  eventHandlers.PlayerJoined({ eventName: "PlayerJoined", roomID, playerID });

  console.log({ roomID });

  socket.on("message", (event: AnyEvent) => {
    const { eventName } = event;
    type HandlerType = EventHandler<typeof eventName>;
    const handleEvent = eventHandlers[eventName] as HandlerType;
    handleEvent({ ...event, playerID });
  });

  socket.on("close", () => {
    eventHandlers.PlayerLeft({ eventName: "PlayerLeft", roomID, playerID });
  });
});

httpServer.listen(process.env.PORT ?? 3000, () =>
  console.log(`listening on 3000`)
);
