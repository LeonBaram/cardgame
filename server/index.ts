import { randomUUID } from "crypto";
import * as express from "express";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import { EventHandlerGroup } from "./event-handlers";

import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import type { EventHandler, Player, Room } from "../models";

const app = express();
app.use(express.static("dist/client"));
app.use("/rooms/:roomID", express.static("dist/client/rooms"));

const httpServer = createServer(app);

const socketServer = new WebSocketServer({
  server: httpServer,
  clientTracking: true,
});

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();
const eventHandlers = new EventHandlerGroup({ rooms, players, socketServer });

socketServer.on("connection", (socket: WebSocket, req: IncomingMessage) => {
  const playerID = randomUUID();
  const roomID = new URL(
    req.url!,
    `http://${req.headers.host}`
  ).searchParams.get("roomID")!;
  players.set(playerID, <Player>{ roomID, socket });
  eventHandlers.PlayerJoined({ eventName: "PlayerJoined", roomID, playerID });

  console.log(`added new player #${playerID}`);

  socket.on("message", (event: AnyEvent) => {
    const { eventName } = event;
    type HandlerType = EventHandler<typeof eventName>;
    const handleEvent = eventHandlers[eventName] as HandlerType;
    handleEvent({ ...event, playerID });
  });

  socket.on("close", () => {
    eventHandlers.PlayerLeft({ eventName: "PlayerLeft", roomID, playerID });
    players.delete(playerID);
  });
});

httpServer.listen(process.env.PORT ?? 3000, () =>
  console.log(`listening on 3000`)
);
