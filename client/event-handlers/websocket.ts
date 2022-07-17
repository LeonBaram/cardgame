import type { Events, EventName } from "../../models";

type Context = {};

interface Handler<E extends EventName> {
  (ctx: Context, data: Events.Data<E>): boolean;
}

export const handlers: {
  [E in EventName]: Handler<E>;
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
  ctx: Context,
  data: Events.Data<"PlayerJoined">
): boolean {
  return false;
}

function PlayerLeft(ctx: Context, data: Events.Data<"PlayerLeft">): boolean {
  return false;
}

function NewHost(ctx: Context, data: Events.Data<"NewHost">): boolean {
  return false;
}

function RoomChangedSize(
  ctx: Context,
  data: Events.Data<"RoomChangedSize">
): boolean {
  return false;
}

function RoomLocked(ctx: Context, data: Events.Data<"RoomLocked">): boolean {
  return false;
}

function RoomUnlocked(
  ctx: Context,
  data: Events.Data<"RoomUnlocked">
): boolean {
  return false;
}

function RoomEnabledPassword(
  ctx: Context,
  data: Events.Data<"RoomEnabledPassword">
): boolean {
  return false;
}

function RoomDisabledPassword(
  ctx: Context,
  data: Events.Data<"RoomDisabledPassword">
): boolean {
  return false;
}

function RoomChangedPassword(
  ctx: Context,
  data: Events.Data<"RoomChangedPassword">
): boolean {
  return false;
}

function GameObjectCreated(
  ctx: Context,
  data: Events.Data<"GameObjectCreated">
): boolean {
  return false;
}

function GameObjectDeleted(
  ctx: Context,
  data: Events.Data<"GameObjectDeleted">
): boolean {
  return false;
}

function GameObjectMoved(
  ctx: Context,
  data: Events.Data<"GameObjectMoved">
): boolean {
  return false;
}

function GameObjectRotated(
  ctx: Context,
  data: Events.Data<"GameObjectRotated">
): boolean {
  return false;
}

function GameObjectFlipped(
  ctx: Context,
  data: Events.Data<"GameObjectFlipped">
): boolean {
  return false;
}

function DeckInsertedCard(
  ctx: Context,
  data: Events.Data<"DeckInsertedCard">
): boolean {
  return false;
}

function DeckRemovedCard(
  ctx: Context,
  data: Events.Data<"DeckRemovedCard">
): boolean {
  return false;
}

function DeckRearranged(
  ctx: Context,
  data: Events.Data<"DeckRearranged">
): boolean {
  return false;
}

function CounterUpdated(
  ctx: Context,
  data: Events.Data<"CounterUpdated">
): boolean {
  return false;
}
