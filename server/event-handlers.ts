import { randomUUID } from "crypto";
import type {
  EventData,
  EventContext,
  EventHandlerTable,
  Player,
  Room,
  Server,
  EventHandler,
  EventName,
} from "../models";

type EventAssertion<E extends EventName = EventName> = (context: EventContext, event: EventData<E>) => boolean;

const validators: {
  [e: EventName]: [EventAssertion<typeof e>, string]
} = {};

// auto-apply default assertions to all handlers with @assert decorator
const defaultAssertions: [EventAssertion, string][] = [
  [({ rooms }, { roomID }) => rooms.has(roomID), "roomID not found in rooms"],
  [
    ({ rooms }, { roomID, playerID }) =>
      rooms.get(roomID)?.playerIDs.has(playerID) ?? false,
    "playerID not found in room[roomID].playerIDs",
  ],
];

const decorators = {
  class: {
    broadcast(target: typeof EventHandlerGroup): void {
      const eventHandlers = target.prototype;
      const { rooms, players } = eventHandlers;
      type Name = "constructor" | keyof EventHandlerGroup;
      const names = Object.getOwnPropertyNames(eventHandlers) as Name[];
      for (const name of names) {
        if (name !== "constructor" && name !== "players" && name !== "rooms") {
          const originalHandler = eventHandlers[name] as EventHandler;
          eventHandlers[name] = (event: EventData) => {
            originalHandler.call(eventHandlers, event);
            const playerIDs = rooms.get(event.roomID)?.playerIDs ?? [];
            for (const id of playerIDs) {
              players.get(id)?.socket.send(event);
            }
          };
        }
      }
    },
    validate(target: typeof EventHandlerGroup): void {
      const eventHandlers = target.prototype;
      let name: EventName;
      for (name in validators) {
        const originalHandler = eventHandlers[name] as EventHandler;
        eventHandlers[name] = (event: EventData) => {
          for (const [assertion, error] of validators[name] ?? []) {
            if (!assertion(eventHandlers, event)) {
              throw error;
            }
          }
          originalHandler.call(eventHandlers, event);
        };
      }
    },
  },
  method: {
    assert:
      <E extends EventName>(assertion?: EventAssertion<E>, errorMessage?: string): MethodDecorator =>
      (_target, key, _descriptor) => {
        const assertions = validators[key as E] ?? [
          ...defaultAssertions,
        ];
        if (assertion) {
          assertions.push([assertion, errorMessage ?? assertion.toString()]);
        }
        validators[key as EventName] = assertions;
      },
  },
};

const { broadcast, validate } = decorators.class;
const { assert } = decorators.method;

@broadcast
@validate
export class EventHandlerGroup implements EventHandlerTable, EventContext {
  readonly players!: Map<string, Player>;
  readonly rooms!: Map<string, Room>;

  constructor(context: EventContext) {
    Object.assign(this, context);
  }

  PlayerJoined(event: EventData<"PlayerJoined">): void {
    const { roomID, playerID } = event;
    const player = this.players.get(playerID)!;
    const prevRoomID = player.roomID;
    player.roomID = roomID;
    if (this.rooms.has(prevRoomID)) {
      this.PlayerLeft({ ...event, roomID: prevRoomID });
    }
    if (this.rooms.has(roomID)) {
      this.rooms.get(roomID)!.playerIDs.add(playerID);
      console.log(`added player #${playerID.slice(0, 4)} to room #${roomID}`);
    } else {
      this.rooms.set(roomID, {
        playerIDs: new Set([playerID]),
        hostPlayerID: playerID,
        gameObjects: new Map(),
      });
      console.log(
        `created new room #${roomID} with host #${playerID.slice(0, 4)}`
      );
    }
  }

  @assert()
  PlayerLeft(event: EventData<"PlayerLeft">): void {
    const { roomID, playerID } = event;
    const room = this.rooms.get(roomID)!;
    room.playerIDs.delete(playerID);
    console.log(`removed player #${playerID.slice(0, 4)} from room #${roomID}`);

    if (room.playerIDs.size > 0) {
      this.PlayerBecameHost({ ...event, newHostID: [...room.playerIDs][0] });
    } else {
      this.rooms.delete(roomID);
      console.log(`deleted empty room #${roomID}`);
    }
  }
  @assert(({rooms},{roomID,newHostID})=>)
  PlayerBecameHost(event: EventData<"PlayerBecameHost">): void {
    const { roomID, newHostID } = event;
    const room = this.rooms.get(roomID)!;
    room.hostPlayerID = newHostID;
    console.log(
      `changed host of room #${roomID} to #${room.hostPlayerID.slice(0, 4)}`
    );
  }

  GameObjectCreated(event: EventData<"GameObjectCreated">): void {
    const { roomID, ...newGameObject } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const gameObjectID = randomUUID();
    gameObjects.set(gameObjectID, newGameObject);
    console.log(
      `in room #${roomID}, created new ${
        newGameObject.gameObjectType
      } #${gameObjectID.slice(0, 4)}`
    );
  }

  GameObjectDeleted(event: EventData<"GameObjectDeleted">): void {
    const { gameObjectID, roomID } = event;
    const room = this.rooms.get(roomID)!;
    room.gameObjects.delete(gameObjectID);
    console.log(
      `in room #${roomID}, deleted game object #${gameObjectID.slice(0, 4)}`
    );
  }

  GameObjectMoved(event: EventData<"GameObjectMoved">): void {
    const { gameObjectID, roomID, x, y } = event;
    const gameObject = this.rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
    gameObject.x = x;
    gameObject.y = y;
  }

  GameObjectRotated(event: EventData<"GameObjectRotated">): void {
    const { gameObjectID, roomID, angle } = event;
    const gameObject = this.rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
    gameObject.angle = angle;
  }

  GameObjectFlipped(event: EventData<"GameObjectFlipped">): void {
    const { gameObjectID, roomID, isFaceUp } = event;
    const gameObject = this.rooms.get(roomID)!.gameObjects.get(gameObjectID)!;
    gameObject.isFaceUp = isFaceUp;
  }

  GameObjectCopied(event: EventData<"GameObjectCopied">): void {
    const { gameObjectID, roomID, x, y } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const sourceObject = gameObjects.get(gameObjectID)!;
    this.GameObjectCreated({
      ...event,
      ...sourceObject,
      x,
      y,
    });
  }

  DeckInsertedCard(event: EventData<"DeckInsertedCard">): void {
    const { gameObjectID, roomID, scryfallID, index } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const deck = gameObjects.get(gameObjectID)! as Server.Deck;
    if (deck.gameObjectType !== "Deck") {
      throw `${event.eventName}: expected game object #${gameObjectID.slice(
        0,
        4
      )} to be a Deck, not a ${deck.gameObjectType}`;
    }
    if (index <= 0) {
      deck.scryfallIDs.unshift(scryfallID);
    } else if (index >= deck.scryfallIDs.length) {
      deck.scryfallIDs.push(scryfallID);
    } else {
      deck.scryfallIDs.splice(index, 0, scryfallID);
    }
    console.log(
      `in room #${roomID}, updated contents of deck #${gameObjectID.slice(
        0,
        4
      )}: inserted card with scryfall ID #${scryfallID.slice(
        0,
        4
      )} ${index} cards from the top`
    );
  }

  DeckRemovedCard(event: EventData<"DeckRemovedCard">): void {
    const { gameObjectID, roomID, index } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const deck = gameObjects.get(gameObjectID)! as Server.Deck;

    if (deck.gameObjectType !== "Deck") {
      throw `${event.eventName}: expected game object #${gameObjectID.slice(
        0,
        4
      )} to be a Deck, not a ${deck.gameObjectType}`;
    }
    if (index < 0 || deck.scryfallIDs.length <= index) {
      throw `${event.eventName}: index ${index} should be in range [0, ${deck.scryfallIDs.length})`;
    }
    console.log(
      `in room #${roomID}, updated contents of deck #${gameObjectID.slice(
        0,
        4
      )}: removed card ${index} cards from the top`
    );
  }

  DeckReordered(event: EventData<"DeckReordered">): void {
    const { gameObjectID, roomID, indices } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const deck = gameObjects.get(gameObjectID)! as Server.Deck;
    if (deck.gameObjectType !== "Deck") {
      throw `${event.eventName}: expected game object #${gameObjectID.slice(
        0,
        4
      )} to be a Deck, not a ${deck.gameObjectType}`;
    }

    const { length } = deck.scryfallIDs;
    if (indices.length !== length) {
      throw `${event.eventName}: expected indices ${indices} to have length ${length}, not ${indices.length}`;
    }
    if ([...indices].sort((a, b) => a - b).some((x, i) => i !== x)) {
      throw `${event.eventName}: expected indices ${indices} to be a valid index permutation; must be an arrangement of range [0, length)`;
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
    console.log(
      `in room #${roomID}, updated indices of deck #${gameObjectID.slice(
        0,
        4
      )} to ${indices}`
    );
  }

  CounterUpdated(event: EventData<"CounterUpdated">): void {
    const { gameObjectID, roomID, val } = event;
    const { gameObjects } = this.rooms.get(roomID)!;
    const counter = gameObjects.get(gameObjectID)! as Server.Counter;
    if (counter.gameObjectType !== "Counter") {
      throw `${event.eventName}: expected game object #${gameObjectID.slice(
        0,
        4
      )} to be a Counter, not a ${counter.gameObjectType}`;
    }
    counter.val = val;
    console.log(
      `in room #${roomID}, updated val of counter #${gameObjectID.slice(
        0,
        4
      )} to ${val}`
    );
  }
}
// validate IDs for room, player, game object
// assume all arguments are of the correct type (should be enforced by client)
// if (eventName !== "PlayerJoined") {
//   if (!rooms.has(roomID)) {
//     throw `${eventName}: cannot find room #${roomID}`;
//   }
//   if (!rooms.get(roomID)!.playerIDs.has(playerID)) {
//     throw `${eventName}: cannot find player #${playerID} in room #${roomID}`;
//   }
// }
// if (eventName !== "GameObjectCreated" && "gameObjectID" in event) {
//   const { gameObjectID } = event as GameObjectEvent;
//   if (!rooms.get(roomID)!.gameObjects.has(gameObjectID)) {
//     throw `${eventName}: cannot find game object #${gameObjectID} in room #${roomID}`;
//   }
// }

// broadcast event
// const { playerIDs } = rooms.get(roomID)!;
// for (const otherID of playerIDs) {
//   if (otherID !== playerID) {
//     const otherSocket = players.get(otherID)!.socket!;
//     if (!socketServer.clients.has(otherSocket)) {
//       throw `cannot find websocket of player #${otherID}`;
//     }
//     otherSocket.send(event);
//   }
// }
