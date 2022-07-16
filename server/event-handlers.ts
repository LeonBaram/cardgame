import { EventContext, EventData, Room } from "../models";
import { randomUUID } from "crypto";
import { Server } from "../models";

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
  } else {
    // TODO: broadcast only if room isn't new
  }

  player.roomID = roomID;

  return true;
}

export function PlayerLeft(
  ctx: EventContext,
  data: EventData<"PlayerLeft">
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
    NewHost(ctx, { ...data, newHostID });
  }

  return true;
}

export function NewHost(
  ctx: EventContext,
  data: EventData<"NewHost">
): boolean {
  const { rooms, roomID } = ctx;
  const room = rooms.get(roomID)!;

  const { newHostID } = data;
  room.hostPlayerID = newHostID;
  return true;
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
  const { rooms, roomID } = ctx;
  const { gameObjectID } = data;

  return rooms.get(roomID)?.gameObjects.delete(gameObjectID) ?? false;
}

export function GameObjectMoved(
  ctx: EventContext,
  data: EventData<"GameObjectMoved">
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
  ctx: EventContext,
  data: EventData<"GameObjectRotated">
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
  ctx: EventContext,
  data: EventData<"GameObjectFlipped">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID, isFaceUp } = data;

  const obj = rooms.get(roomID)?.gameObjects.get(gameObjectID);
  if (obj) {
    obj.isFaceUp = isFaceUp;
  }
  return !!obj;
}

export function GameObjectCopied(
  ctx: EventContext,
  data: EventData<"GameObjectCopied">
): boolean {
  const { rooms, roomID } = ctx;
  const { gameObjectID } = data;

  const obj = rooms.get(roomID)?.gameObjects.get(gameObjectID);
  if (obj) {
    const newGameObjectID = randomUUID();
    switch (obj.gameObjectName) {
      case "Card": {
        const { scryfallID } = obj as Server.GameObjects["Card"];
        return CardCreated(ctx, {
          eventName: "CardCreated",
          gameObjectID: newGameObjectID,
          gameObjectName: "Card",
          scryfallID,
        });
      }
      case "Deck": {
        const { scryfallIDs } = obj as Server.GameObjects["Deck"];
        return DeckCreated(ctx, {
          eventName: "DeckCreated",
          gameObjectID: newGameObjectID,
          gameObjectName: "Deck",
          scryfallIDs,
        });
      }
      case "Counter": {
        const { val } = obj as Server.GameObjects["Counter"];
        return CounterCreated(ctx, {
          eventName: "CounterCreated",
          gameObjectID: newGameObjectID,
          gameObjectName: "Counter",
          val,
        });
      }
    }
  }
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
