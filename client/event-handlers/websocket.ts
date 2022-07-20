import type {
  Events,
  EventName,
  Server,
  Client,
  ScryfallCardData,
  Room,
} from "../../models";

import { scryfallFetch } from "../utils/card-importer";

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
  GameObjectFaceUp,
  GameObjectFaceDown,
  DeckInsertedCard,
  DeckRemovedCard,
  DeckRearranged,
  CounterUpdated,
};

async function createCard(
  scene: Phaser.Scene,
  gameObjectID: string,
  gameObject: Server.Card
): Promise<Client.Card> {
  const { scryfallID, x, y, gameObjectName } = gameObject as Server.Card;
  const data = await scryfallFetch({ scryfallID });
  const sprite = scene.add.image(x, y, gameObjectID);
  const uri =
    data.image_uris?.png ??
    data.image_uris?.large ??
    data.image_uris?.normal ??
    data.image_uris?.small ??
    null;

  if (uri === null) {
    throw "TODO: load placeholder";
  }

  scene.load
    .image(gameObjectID, uri)
    .once(Phaser.Loader.Events.COMPLETE, () => {
      sprite.setTexture(gameObjectID).setScale(0.3).setInteractive();
      this.input.setDraggable(sprite);
    })
    .start();

  return <Client.Card>{ gameObjectName, sprite, data };
}

async function createDeck(
  scene: Phaser.Scene,
  gameObjectID: string,
  gameObject: Server.Deck
): Promise<Client.Deck> {
  const { scryfallIDs, x, y, gameObjectName } = gameObject as Server.Deck;

  type OkResult = PromiseFulfilledResult<ScryfallCardData>;
  const data = (
    await Promise.allSettled(
      scryfallIDs.map((scryfallID) => scryfallFetch({ scryfallID }))
    )
  )
    .filter(({ status }) => status === "fulfilled")
    .map((res) => (res as OkResult).value);

  const sprite = scene.add.image(x, y, gameObjectID);
  const { image_uris } = data[0];
  const uri =
    image_uris?.png ??
    image_uris?.large ??
    image_uris?.normal ??
    image_uris?.small ??
    null;

  if (uri === null) {
    throw "TODO: load placeholder";
  }

  scene.load
    .image(gameObjectID, uri)
    .once(Phaser.Loader.Events.COMPLETE, () => {
      sprite.setTexture(gameObjectID).setScale(0.3).setInteractive();
      this.input.setDraggable(sprite);
    })
    .start();

  return <Client.Deck>{ gameObjectName, sprite, data };
}

async function createCounter(
  scene: Phaser.Scene,
  gameObjectID: string,
  gameObject: Server.Counter
): Promise<Client.Counter> {
  const { val, x, y, gameObjectName } = gameObject;
  const sprite = scene.add.image(x, y, gameObjectID);
  scene.load
    .image(gameObjectID, "")
    .once(Phaser.Loader.Events.COMPLETE, () => {
      sprite.setTexture(gameObjectID).setScale(0.3).setInteractive();
      this.input.setDraggable(sprite);
    })
    .start();

  throw "TODO: counter assets";
  return <Client.Counter>{ gameObjectName, sprite, val };
}

async function createGameObject(
  scene: Phaser.Scene,
  gameObjectID: string,
  gameObject: Server.GameObject
): Promise<Client.GameObject> {
  const { gameObjectName } = gameObject;
  switch (gameObjectName) {
    case "Card": {
      return createCard(scene, gameObjectID, gameObject as Server.Card);
    }
    case "Deck": {
      return createDeck(scene, gameObjectID, gameObject as Server.Deck);
    }
    case "Counter": {
      return createCounter(scene, gameObjectID, gameObject as Server.Counter);
    }
  }
}

function createAllGameObjects(
  ctx: Events.Context<"Client">,
  room: Room<"Server">
): void {
  const { scene } = ctx;
  const { gameObjects } = room;
  Promise.all(
    [...gameObjects].map(([id, obj]) => createGameObject(scene, id, obj))
  ).then((vals) => {
    ctx.room = {
      ...room,
      gameObjects: new Map([...gameObjects].map(([id], i) => [id, vals[i]])),
    };
  });
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
    createAllGameObjects(ctx, data.room);

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
  const { room, scene } = ctx;
  const { gameObjectID, gameObject } = data;

  if (room) {
    createGameObject(scene, gameObjectID, gameObject).then((clientObject) =>
      room.gameObjects.set(gameObjectID, clientObject)
    );
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

function GameObjectFaceUp(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectFaceUp">
): boolean {
  return false;
}

function GameObjectFaceDown(
  ctx: Events.Context<"Client">,
  data: Events.Data<"GameObjectFaceDown">
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
