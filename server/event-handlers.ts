import type { Room, Server, Events, EventName } from "../models";
import { randomUUID } from "crypto";

export const handlers: {
  [E in EventName]: Events.Handler<"Server", E>;
} = {
  PlayerJoined,
  PlayerLeft,
  NewHost,
  RoomChangedSize,
  RoomLocked,
  RoomUnlocked,
  RoomEnabledPassword,
  RoomDisabledPassword,
  RoomChangedPassword,
  GameObjectCreated,
  GameObjectDeleted,
  GameObjectMoved,
  GameObjectRotated,
  GameObjectFlipped,
  DeckInsertedCard,
  DeckRemovedCard,
  DeckRearranged,
  CounterUpdated,
};

export function broadcast<E extends EventName>(
  handler: Events.Handler<"Server", E>,
  ...args: Parameters<Events.Handler<"Server", E>>
): boolean {
  if (!handler(...args)) {
    return false;
  }

  const [ctx, data] = args;
  const { socketServer, rooms, roomID, players } = ctx;
  const {} = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  for (const playerID of room.playerIDs) {
    const player = players.get(playerID);
    if (!player) {
      return false;
    }

    const { socket } = player;
    if (!socketServer.clients.has(socket)) {
      return false;
    }
  }

  for (const playerID of room.playerIDs) {
    // for all events other than PlayerJoined, broadcast as normal
    // for a PlayerJoined event, send existing players the newPlayerID,
    // and send the new player the existing Room state
    const { socket } = players.get(playerID)!;
    if (data.eventName !== "PlayerJoined") {
      socket.send(data);
    } else if (playerID === ctx.playerID) {
      type Data = Events.Data<"PlayerJoined">;
      socket.send({ ...data, room } as Data);
    } else {
      type Data = Events.Data<"PlayerJoined">;
      socket.send({ ...data, newPlayerID: playerID } as Data);
    }
  }

  return true;
}

// Room Events
function PlayerJoined(
  ctx: Events.Context<"Server">,
  data: Events.Data<"PlayerJoined">
): boolean {
  const { players, rooms, playerID, roomID } = ctx;

  const player = players.get(playerID);
  if (!player) {
    return false;
  }

  // leave old room if necessary
  const prevRoomID = player.roomID;
  if (prevRoomID !== null && rooms.has(prevRoomID)) {
    const playerLeft = broadcast(
      PlayerLeft,
      { ...ctx, roomID: prevRoomID },
      { ...data, eventName: "PlayerLeft" }
    );
    if (!playerLeft) {
      return false;
    }
  }

  // create new room or add to existing, as necessary
  const room = rooms.get(roomID);
  if (room) {
    room.playerIDs.add(playerID);
  } else {
    rooms.set(roomID, <Room<"Server">>{
      playerIDs: new Set(playerID),
      hostPlayerID: playerID,
      gameObjects: new Map(),
    });
  }

  player.roomID = roomID;
  return true;
}

function PlayerLeft(
  ctx: Events.Context<"Server">,
  data: Events.Data<"PlayerLeft">
): boolean {
  const { players, rooms, playerID, roomID } = ctx;

  const player = players.get(playerID);
  if (!player) {
    return false;
  }

  const room = rooms.get(roomID)!;
  if (!room) {
    return false;
  }

  room.playerIDs.delete(playerID);
  player.roomID = null;

  // delete room if empty
  if (room.playerIDs.size === 0) {
    rooms.delete(roomID);
  }
  // choose new host if necessary
  else if (room.hostPlayerID === playerID) {
    const newHostID = [...room.playerIDs][0];
    const newHost = broadcast(NewHost, ctx, {
      ...data,
      eventName: "NewHost",
      newHostID,
    });
    if (!newHost) {
      return false;
    }
  }

  return true;
}

function NewHost(
  ctx: Events.Context<"Server">,
  data: Events.Data<"NewHost">
): boolean {
  const { rooms, roomID } = ctx;
  const { newHostID } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.hostPlayerID = newHostID;
  return true;
}

function RoomChangedSize(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomChangedSize">
): boolean {
  const { rooms, roomID } = ctx;
  const { newRoomSize } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.size = newRoomSize;
  return true;
}

function RoomLocked(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomLocked">
): boolean {
  const { rooms, roomID } = ctx;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.isLocked = true;
  return true;
}

function RoomUnlocked(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomUnlocked">
): boolean {
  const { rooms, roomID } = ctx;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.isLocked = false;
  return true;
}

function RoomEnabledPassword(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomEnabledPassword">
): boolean {
  const { rooms, roomID } = ctx;
  const { passwordHash } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.passwordHash = passwordHash;
  return true;
}

function RoomDisabledPassword(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomDisabledPassword">
): boolean {
  const { rooms, roomID } = ctx;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.passwordHash = null;
  return true;
}

function RoomChangedPassword(
  ctx: Events.Context<"Server">,
  data: Events.Data<"RoomChangedPassword">
): boolean {
  const { rooms, roomID } = ctx;
  const { passwordHash } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  room.passwordHash = passwordHash;
  return true;
}

function GameObjectCreated(
  ctx: Events.Context<"Server">,
  data: Events.Data<"GameObjectCreated">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObject } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const gameObjectID = randomUUID();
  room.gameObjects.set(gameObjectID, gameObject);
  return true;
}

// Game Object Events
function GameObjectDeleted(
  ctx: Events.Context<"Server">,
  data: Events.Data<"GameObjectDeleted">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const deleted = room.gameObjects.delete(gameObjectID);
  if (!deleted) {
    return false;
  }

  return true;
}

function GameObjectMoved(
  ctx: Events.Context<"Server">,
  data: Events.Data<"GameObjectMoved">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, x, y } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const gameObject = room.gameObjects.get(gameObjectID);
  if (!gameObject) {
    return false;
  }

  gameObject.x = x;
  gameObject.y = y;
  return true;
}

function GameObjectRotated(
  ctx: Events.Context<"Server">,
  data: Events.Data<"GameObjectRotated">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, angle } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const gameObject = room.gameObjects.get(gameObjectID);
  if (!gameObject) {
    return false;
  }

  gameObject.angle = angle;
  return true;
}

function GameObjectFlipped(
  ctx: Events.Context<"Server">,
  data: Events.Data<"GameObjectFlipped">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, isFaceUp } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const gameObject = room.gameObjects.get(gameObjectID);
  if (!gameObject) {
    return false;
  }

  gameObject.isFaceUp = isFaceUp;
  return true;
}

// Deck Specific Events
function DeckInsertedCard(
  ctx: Events.Context<"Server">,
  data: Events.Data<"DeckInsertedCard">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, index, scryfallID } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const deck = room.gameObjects.get(gameObjectID) as Server.GameObject<"Deck">;
  if (!deck) {
    return false;
  }

  deck.scryfallIDs.splice(index, 0, scryfallID);
  return true;
}

function DeckRemovedCard(
  ctx: Events.Context<"Server">,
  data: Events.Data<"DeckRemovedCard">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, index } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const deck = room.gameObjects.get(gameObjectID) as Server.GameObject<"Deck">;
  if (!deck) {
    return false;
  }

  deck.scryfallIDs.splice(index, 1);
  return true;
}

function DeckRearranged(
  ctx: Events.Context<"Server">,
  data: Events.Data<"DeckRearranged">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, indices } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  const deck = room.gameObjects.get(gameObjectID) as Server.GameObject<"Deck">;
  if (!deck) {
    return false;
  }

  const { scryfallIDs } = deck;
  if (scryfallIDs.length !== indices.length) {
    return false;
  }

  const rearranged = indices.map((i) => scryfallIDs[i]);
  deck.scryfallIDs = rearranged;
  return true;
}

// Counter Specific Events
function CounterUpdated(
  ctx: Events.Context<"Server">,
  data: Events.Data<"CounterUpdated">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, val } = data;

  const room = rooms.get(roomID);
  if (!room) {
    return false;
  }

  type Counter = Server.GameObject<"Counter">;
  const counter = room.gameObjects.get(gameObjectID) as Counter;
  if (!counter) {
    return false;
  }

  counter.val = val;
  return true;
}
