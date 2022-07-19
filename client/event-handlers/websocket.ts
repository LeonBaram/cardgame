import type {
  Events,
  EventName,
  Server,
  GameObjectName,
  Client,
} from "../../models";

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

function hydrate<G extends GameObjectName>([gameObjectID, gameObject]: [
  string,
  Server.GameObject<G>
]): [string, Client.GameObject<G>] {
  // TODO: implement hydration
  return [gameObjectID, {} as Client.GameObject<G>];
}

function PlayerJoined(
  ctx: Events.Context<"Client">,
  data: Events.Data<"PlayerJoined">
): boolean {
  const { room } = ctx;
  const { newPlayerID } = data;

  if (room && newPlayerID) {
    room.playerIDs.add(newPlayerID);

    return true;
  } else if (room === null && data.room) {
    const gameObjects = new Map([...data.room.gameObjects].map(hydrate));

    ctx.room = { ...data.room, gameObjects };
    return true;
  }
  return false;
}

function PlayerLeft(
  ctx: Events.Context<"Client">,
  data: Events.Data<"PlayerLeft">
): boolean {
  const { room } = ctx;
  const { departedPlayerID } = data;

  if (room && departedPlayerID) {
    return room.playerIDs.delete(departedPlayerID);
  }
  return false;
}

function NewHost(
  ctx: Events.Context<"Client">,
  data: Events.Data<"NewHost">
): boolean {
  const { room } = ctx;
  const { newHostID } = data;

  if (room?.playerIDs.has(newHostID)) {
    room.hostPlayerID = newHostID;
    return true;
  }
  return false;
}

function RoomChangedSize(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomChangedSize">
): boolean {
  const { room } = ctx;
  const { newRoomSize } = data;

  if (room) {
    room.size = newRoomSize;
    return true;
  }
  return false;
}

function RoomLocked(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomLocked">
): boolean {
  const { room } = ctx;

  if (room) {
    room.isLocked = true;
    return true;
  }
  return false;
}

function RoomUnlocked(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomUnlocked">
): boolean {
  const { room } = ctx;

  if (room) {
    room.isLocked = false;
    return true;
  }
  return false;
}

function RoomEnabledPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomEnabledPassword">
): boolean {
  // do nothing
  return true;
}

function RoomDisabledPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomDisabledPassword">
): boolean {
  // do nothing
  return true;
}

function RoomChangedPassword(
  ctx: Events.Context<"Client">,
  data: Events.Data<"RoomChangedPassword">
): boolean {
  // do nothing
  return true;
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
