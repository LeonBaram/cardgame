import type { Events, EventName } from "../../models";

export const handlers: {
  [E in EventName]: Events.Handler<"Client", E>;
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

function PlayerJoined(
  ctx: Events.Context<"Client">,
  data: Events.Data<"PlayerJoined">
): boolean {
  if ("newPlayerID" in data && ctx.room !== null) {
    ctx.room.playerIDs.add(data.newPlayerID);
  } else if ("room" in data && ctx.room === null) {
    const { gameObjects, ...room } = data.room;
    ctx.room = { ...room, gameObjects: new Map() };
    // TODO: hydrate gameObjects
  }
  return false;
}

function PlayerLeft(
  ctx: Events.Context<"Client">,
  data: Events.Data<"PlayerLeft">
): boolean {
  return false;
}

function NewHost(
  ctx: Events.Context<"Client">,
  data: Events.Data<"NewHost">
): boolean {
  return false;
}

function RoomChangedSize(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomChangedSize">
): boolean {
  return false;
}

function RoomLocked(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomLocked">
): boolean {
  return false;
}

function RoomUnlocked(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomUnlocked">
): boolean {
  return false;
}

function RoomEnabledPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomEnabledPassword">
): boolean {
  return false;
}

function RoomDisabledPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomDisabledPassword">
): boolean {
  return false;
}

function RoomChangedPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomChangedPassword">
): boolean {
  return false;
}

function GameObjectCreated(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectCreated">
): boolean {
  return false;
}

function GameObjectDeleted(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectDeleted">
): boolean {
  return false;
}

function GameObjectMoved(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectMoved">
): boolean {
  return false;
}

function GameObjectRotated(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectRotated">
): boolean {
  return false;
}

function GameObjectFlipped(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectFlipped">
): boolean {
  return false;
}

function DeckInsertedCard(
  ctx: Events.Context<"Client">,
  data: Events.Data<"DeckInsertedCard">
): boolean {
  return false;
}

function DeckRemovedCard(
  ctx: Events.Context<"Client">,
  data: Events.Data<"DeckRemovedCard">
): boolean {
  return false;
}

function DeckRearranged(
  ctx: Events.Context<"Client">,
  data: Events.Data<"DeckRearranged">
): boolean {
  return false;
}

function CounterUpdated(
  ctx: Events.Context<"Client">,
  data: Events.Data<"CounterUpdated">
): boolean {
  return false;
}
