import { EventContext, EventData, Room } from "../models";

// Room Events
export function PlayerJoined(
  ctx: EventContext,
  data: EventData<"PlayerJoined">
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
    PlayerLeft({ ...ctx, roomID: prevRoomID }, data);
  }

  // create new room if necessary
  if (!room) {
    rooms.set(roomID, <Room>{
      playerIDs: new Set(playerID),
      hostPlayerID: playerID,
      gameObjects: new Map(),
    });
  }

  player.roomID = roomID;

  return true;
}

export function PlayerLeft(
  ctx: EventContext,
  data: EventData<"PlayerLeft">
): boolean {
  return false;
}

export function NewHost(
  ctx: EventContext,
  data: EventData<"NewHost">
): boolean {
  return false;
}

export function RoomChangedSize(
  ctx: EventContext,
  data: EventData<"RoomChangedSize">
): boolean {
  return false;
}

export function RoomLocked(
  ctx: EventContext,
  data: EventData<"RoomLocked">
): boolean {
  return false;
}

export function RoomUnlocked(
  ctx: EventContext,
  data: EventData<"RoomUnlocked">
): boolean {
  return false;
}

export function RoomEnabledPassword(
  ctx: EventContext,
  data: EventData<"RoomEnabledPassword">
): boolean {
  return false;
}

export function RoomDisabledPassword(
  ctx: EventContext,
  data: EventData<"RoomDisabledPassword">
): boolean {
  return false;
}

export function RoomChangedPassword(
  ctx: EventContext,
  data: EventData<"RoomChangedPassword">
): boolean {
  return false;
}

// Game Object Events
export function GameObjectDeleted(
  ctx: EventContext,
  data: EventData<"GameObjectDeleted">
): boolean {
  return false;
}

export function GameObjectMoved(
  ctx: EventContext,
  data: EventData<"GameObjectMoved">
): boolean {
  return false;
}

export function GameObjectRotated(
  ctx: EventContext,
  data: EventData<"GameObjectRotated">
): boolean {
  return false;
}

export function GameObjectFlipped(
  ctx: EventContext,
  data: EventData<"GameObjectFlipped">
): boolean {
  return false;
}

export function GameObjectCopied(
  ctx: EventContext,
  data: EventData<"GameObjectCopied">
): boolean {
  return false;
}

// Card Specific Events
export function CardCreated(
  ctx: EventContext,
  data: EventData<"CardCreated">
): boolean {
  return false;
}

// Deck Specific Events
export function DeckCreated(
  ctx: EventContext,
  data: EventData<"DeckCreated">
): boolean {
  return false;
}

export function DeckInsertedCard(
  ctx: EventContext,
  data: EventData<"DeckInsertedCard">
): boolean {
  return false;
}

export function DeckRemovedCard(
  ctx: EventContext,
  data: EventData<"DeckRemovedCard">
): boolean {
  return false;
}

export function DeckReordered(
  ctx: EventContext,
  data: EventData<"DeckReordered">
): boolean {
  return false;
}

// Counter Specific Events
export function CounterCreated(
  ctx: EventContext,
  data: EventData<"CounterCreated">
): boolean {
  return false;
}

export function CounterUpdated(
  ctx: EventContext,
  data: EventData<"CounterUpdated">
): boolean {
  return false;
}
