import { Room, Server, Events } from "../models";
import { randomUUID } from "crypto";

// Room Events
export function PlayerJoined(
  ctx: Events.Context,
  data: Events.Data<"PlayerJoined">
): boolean {
  const { players, rooms, playerID, roomID } = ctx;
  const player = players.get(playerID)!;
  const room = rooms.get(roomID);

  // if room exists, add player to room if allowed
  if (room) {
    // TODO: check if room is full, locked, or password-enabled
    room.playerIDs.add(playerID);
  }

  // leave old room if necessary
  const prevRoomID = player.roomID;
  if (prevRoomID !== null && rooms.has(prevRoomID)) {
    PlayerLeft(
      { ...ctx, roomID: prevRoomID },
      { ...data, eventName: "PlayerLeft" }
    );
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
  const player = players.get(playerID)!;
  const room = rooms.get(roomID)!;

  room.playerIDs.delete(playerID);
  player.roomID = null;

  // delete room if empty
  if (room.playerIDs.size === 0) {
    rooms.delete(roomID);
  }
  // choose new host if necessary
  else if (room.hostPlayerID === playerID) {
    const newHostID = [...room.playerIDs][0];
    NewHost(ctx, { ...data, eventName: "NewHost", newHostID });
  }

  return true;
}

export function NewHost(
  ctx: Events.Context,
  data: Events.Data<"NewHost">
): boolean {
  const { rooms, roomID } = ctx;
  const room = rooms.get(roomID)!;

  const { newHostID } = data;
  room.hostPlayerID = newHostID;
  return true;
}

export function RoomChangedSize(
  ctx: Events.Context,
  data: Events.Data<"RoomChangedSize">
): boolean {
  return false;
}

export function RoomLocked(
  ctx: Events.Context,
  data: Events.Data<"RoomLocked">
): boolean {
  return false;
}

export function RoomUnlocked(
  ctx: Events.Context,
  data: Events.Data<"RoomUnlocked">
): boolean {
  return false;
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

  const gameObjectID = randomUUID();
  return !!rooms.get(roomID)?.gameObjects.set(gameObjectID, gameObject);
}

// Game Object Events
export function GameObjectDeleted(
  ctx: Events.Context,
  data: Events.Data<"GameObjectDeleted">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID } = data;

  return rooms.get(roomID)?.gameObjects.delete(gameObjectID) ?? false;
}

export function GameObjectMoved(
  ctx: Events.Context,
  data: Events.Data<"GameObjectMoved">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, x, y } = data;

  const obj = rooms.get(roomID)?.gameObjects.get(gameObjectID);
  if (obj) {
    obj.x = x;
    obj.y = y;
  }
  return !!obj;
}

export function GameObjectRotated(
  ctx: Events.Context,
  data: Events.Data<"GameObjectRotated">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, angle } = data;

  const obj = rooms.get(roomID)?.gameObjects.get(gameObjectID);
  if (obj) {
    obj.angle = angle;
  }
  return !!obj;
}

export function GameObjectFlipped(
  ctx: Events.Context,
  data: Events.Data<"GameObjectFlipped">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, isFaceUp } = data;

  const obj = rooms.get(roomID)?.gameObjects.get(gameObjectID);
  if (obj) {
    obj.isFaceUp = isFaceUp;
  }
  return !!obj;
}

// Deck Specific Events
export function DeckInsertedCard(
  ctx: Events.Context,
  data: Events.Data<"DeckInsertedCard">
): boolean {
  return false;
}

export function DeckRemovedCard(
  ctx: Events.Context,
  data: Events.Data<"DeckRemovedCard">
): boolean {
  return false;
}

export function DeckReordered(
  ctx: Events.Context,
  data: Events.Data<"DeckReordered">
): boolean {
  return false;
}

// Counter Specific Events
export function CounterUpdated(
  ctx: Events.Context,
  data: Events.Data<"CounterUpdated">
): boolean {
  return false;
}
