import * as express from "express";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";

import type { WebSocket } from "ws";
import type { WebSocketEventData } from "../models/Events";

const app = express();

app.use(express.static("dist/client"));

const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws: WebSocket) => {
  ws.send("[immediate greeting]");

  ws.on("message", (data: WebSocketEventData) => {});
});

httpServer.listen(process.env.PORT ?? 3000, () =>
  console.log(`listening on 3000`)
);
