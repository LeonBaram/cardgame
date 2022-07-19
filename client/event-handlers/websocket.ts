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

function hydrate<G extends GameObjectName>(
  gameObject: Server.GameObject<G>
): Client.GameObject<G> {
  // TODO: implement hydration
  return {} as Client.GameObject<G>;
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
    const gameObjects = new Map(
      [...data.room.gameObjects].map(([id, obj]) => [id, hydrate(obj)])
    );

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
  const { room } = ctx;
  const { gameObjectID, gameObject } = data;

  if (room) {
    room.gameObjects.set(gameObjectID, hydrate(gameObject));
    return true;
  }
  return false;
}

function GameObjectDeleted(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectDeleted">
): boolean {
  const { room } = ctx;
  const { gameObjectID } = data;

  return !!room && room.gameObjects.delete(gameObjectID);
}

function GameObjectMoved(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectMoved">
): boolean {
  const { room } = ctx;
  const { gameObjectID, x, y } = data;

  if (!room) {
    return false;
  }

  const gameObject = room.gameObjects.get(gameObjectID);
  if (!gameObject) {
    return false;
  }

  gameObject.sprite.x = x;
  gameObject.sprite.y = y;
  return true;
}

function GameObjectRotated(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectRotated">
): boolean {
  const { room } = ctx;
  const { gameObjectID, angle } = data;

  if (!room) {
    return false;
  }

  const gameObject = room.gameObjects.get(gameObjectID);
  if (!gameObject) {
    return false;
  }

  gameObject.sprite.angle = angle;
  return true;
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
