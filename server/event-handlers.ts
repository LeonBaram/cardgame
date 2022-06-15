import { randomUUID } from "crypto";

import type {
  EventHandler,
  EventHandlerContext,
  EventHandlerTable,
  GameObjectEvent,
  Server,
} from "../models";

export function createEventHandlers({
  socketServer,
  players,
  rooms,
}: EventHandlerContext): EventHandlerTable {
  const handlers: EventHandlerTable = {
    PlayerJoined: (event): void => {
      const { roomID, playerID } = event;
      const player = players.get(playerID!)!;
      rooms.get(player.roomID)?.playerIDs.delete(playerID!);
      player.roomID = roomID;

      if (rooms.has(roomID)) {
        rooms.get(roomID)!.playerIDs.add(playerID!);
      } else {
        rooms.set(roomID, {
          playerIDs: new Set([playerID!]),
          hostPlayerID: playerID!,
          gameObjects: new Map(),
        });
      }
    },
    PlayerLeft: (event): void => {
      const { roomID, playerID } = event;
      const room = rooms.get(roomID)!;
      room.playerIDs.delete(playerID!);
      players.delete(playerID!);

      if (room.playerIDs.size > 0) {
        room.hostPlayerID = [...room.playerIDs][0];
      } else {
        rooms.delete(roomID);
      }
    },
    PlayerBecameHost: (event): void => {
      const { roomID, newHostID } = event;
      const room = rooms.get(roomID)!;
      room.hostPlayerID = newHostID;
    },
    GameObjectCreated: (event): void => {
      const { gameObjectID, roomID, gameObjectType, objectData } = event;
      const { gameObjects } = rooms.get(roomID)!;

      gameObjects.set(gameObjectID, <Server.AnyGameObject>{
        isFaceUp: false,
        gameObjectType,
        ...objectData,
        angle: 0,
        x: 0,
        y: 0,
      });
    },
    GameObjectDeleted: (event): void => {
      const { gameObjectID, roomID } = event;
      const room = rooms.get(roomID)!;
      room.gameObjects.delete(gameObjectID);
    },
    GameObjectMoved: (event): void => {
      const { gameObjectID, roomID, x, y } = event;
      const gameObject = rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
      gameObject.x = x;
      gameObject.y = y;
    },
    GameObjectRotated: (event): void => {
      const { gameObjectID, roomID, angle } = event;
      const gameObject = rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
      gameObject.angle = angle;
    },
    GameObjectFlipped: (event): void => {
      const { gameObjectID, roomID, isFaceUp } = event;
      const gameObject = rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
      gameObject.isFaceUp = isFaceUp;
    },
    GameObjectCopied: (event): void => {
      const { gameObjectID, roomID, newGameObjectID, x, y } = event;
      const { gameObjects } = rooms.get(roomID)!;
      const sourceObject = gameObjects.get(gameObjectID)!;
      gameObjects.set(newGameObjectID, { ...sourceObject, x, y });
    },
    DeckInsertedCard: (event): void => {
      const { gameObjectID, roomID, index, cardID } = event;
      const { gameObjects } = rooms.get(roomID)!;
      const deck = gameObjects.get(gameObjectID)! as Server.GameObjects["Deck"];
      const card = gameObjects.get(cardID)! as Server.GameObjects["Card"];
      gameObjects.delete(cardID);

      if (index < 0) {
        deck.scryfallIDs.unshift(card.scryfallID);
      } else if (index >= deck.scryfallIDs.length) {
        deck.scryfallIDs.push(card.scryfallID);
      } else {
        deck.scryfallIDs.splice(index, 0, card.scryfallID);
      }
    },
    DeckRemovedCard: (event): void => {
      const { gameObjectID, roomID, index } = event;
      const { gameObjects } = rooms.get(roomID)!;
      const deck = gameObjects.get(gameObjectID)! as Server.GameObjects["Deck"];

      if (index < 0 || deck.scryfallIDs.length <= index) {
        throw `${event.eventName}: index out of bounds: index ${index} should be in range [0, ${deck.scryfallIDs.length})`;
      }

      const scryfallID = deck.scryfallIDs.splice(index, 1)[0];
      const { x, y, angle, isFaceUp } = deck;
      let card: Server.GameObjects["Card"] = {
        gameObjectType: "Card",
        scryfallID,
        isFaceUp,
        angle,
        x,
        y,
      };
      gameObjects.set(randomUUID(), card);
    },
    DeckReordered: (event): void => {
      const { gameObjectID, roomID, indices } = event;

      const { gameObjects } = rooms.get(roomID)!;

      type Deck = Server.GameObjects["Deck"];
      const deck = gameObjects.get(gameObjectID)! as Deck;

      const { length } = deck.scryfallIDs;
      if (indices.length !== length) {
        throw `${event.eventName}: bad arg "indices"; ${indices} must have length ${length}`;
      }
      if ([...indices].sort((a, b) => a - b).some((x, i) => i !== x)) {
        throw `${event.eventName}: bad arg "indices"; ${indices} must be a valid permutation of [0, indices.length)`;
      }

      const temp: string[] = Array(length).fill(null);
      let cardID: string;
      let index: number;
      for (let i = 0; i < length; i++) {
        cardID = deck.scryfallIDs[i];
        index = indices[i];
        temp[index] = cardID;
      }
      for (let i = 0; i < length; i++) {
        deck.scryfallIDs[i] = temp[i];
      }
    },
    CounterUpdated: (event): void => {
      const { gameObjectID, roomID, val } = event;
      const { gameObjects } = rooms.get(roomID)!;
      const counter = gameObjects.get(
        gameObjectID
      )! as Server.GameObjects["Counter"];
      counter.val = val;
    },
  };

  let eventName: keyof typeof handlers;
  for (eventName in handlers) {
    type HandlerType = EventHandler<typeof eventName>;
    const handleEvent = handlers[eventName] as HandlerType;

    // wrap base event handler func with "middleware"-like functionality
    handlers[eventName] = (event): void => {
      const { roomID, playerID } = event;
      // validate IDs for room, player, game object
      // assume all arguments are of the correct type (should be enforced by client)
      if (eventName !== "PlayerJoined") {
        if (!rooms.has(roomID)) {
          throw `${eventName}: cannot find room #${roomID}`;
        }
        if (!rooms.get(roomID)!.playerIDs.has(playerID!)) {
          throw `${eventName}: cannot find player #${playerID!} in room #${roomID}`;
        }
      }
      if (eventName !== "GameObjectCreated" && "gameObjectID" in event) {
        const { gameObjectID } = event as GameObjectEvent;
        if (!rooms.get(roomID)!.gameObjects.has(gameObjectID)) {
          throw `${eventName}: cannot find game object #${gameObjectID} in room #${roomID}`;
        }
      }

      handleEvent(event);

      // broadcast event
      const { playerIDs } = rooms.get(roomID)!;
      for (const otherID of playerIDs) {
        if (otherID !== playerID!) {
          const otherSocket = players.get(otherID)!.socket!;
          if (!socketServer.clients.has(otherSocket)) {
            throw `cannot find websocket of player #${otherID}`;
          }
          otherSocket.send(event);
        }
      }
    };
  }

  return handlers;
}
