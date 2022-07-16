import { Room, Server, Events, EventName } from "../models";
import { randomUUID } from "crypto";

interface EventHandler<E extends EventName> {
  (ctx: Events.Context, data: Events.Data<E>): boolean;
}

export function broadcast<E extends EventName>(
  handler: EventHandler<E>,
  ...args: Parameters<EventHandler<E>>
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
    players.get(playerID)!.socket.send(data);
  }

  return true;
}

// Room Events
export function PlayerJoined(
  ctx: Events.Context,
  data: Events.Data<"PlayerJoined">
): boolean {
  const { players, rooms, playerID, roomID } = ctx;

  const player = players.get(playerID);
  if (!player) {
    return false;
  }

  const room = rooms.get(roomID);

  // if room exists, add player to room if allowed
  if (room) {
    // TODO: check if room is full, locked, or password-enabled
    room.playerIDs.add(playerID);
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

  // create new room if necessary
  if (!room) {
    rooms.set(roomID, <Room>{
      playerIDs: new Set(playerID),
      hostPlayerID: playerID,
      gameObjects: new Map(),
    });
  } else {
    // TODO: broadcast only if room isn't new
  }

  player.roomID = roomID;
  return true;
}

export function PlayerLeft(
  ctx: Events.Context,
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

export function NewHost(
  ctx: Events.Context,
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

export function RoomChangedSize(
  ctx: Events.Context,
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

export function RoomLocked(
  ctx: Events.Context,
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

export function RoomUnlocked(
  ctx: Events.Context,
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

export function RoomEnabledPassword(
  ctx: Events.Context,
  data: Events.Data<"RoomEnabledPassword">
): boolean {
  return false;
}

export function RoomDisabledPassword(
  ctx: Events.Context,
  data: Events.Data<"RoomDisabledPassword">
): boolean {
  return false;
}

export function RoomChangedPassword(
  ctx: Events.Context,
  data: Events.Data<"RoomChangedPassword">
): boolean {
  return false;
}

export function GameObjectCreated(
  ctx: Events.Context,
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
export function GameObjectDeleted(
  ctx: Events.Context,
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

export function GameObjectMoved(
  ctx: Events.Context,
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

export function GameObjectRotated(
  ctx: Events.Context,
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

export function GameObjectFlipped(
  ctx: Events.Context,
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
export function DeckInsertedCard(
  ctx: Events.Context,
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

export function DeckRemovedCard(
  ctx: Events.Context,
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

export function DeckRearranged(
  ctx: Events.Context,
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
export function CounterUpdated(
  ctx: Events.Context,
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
