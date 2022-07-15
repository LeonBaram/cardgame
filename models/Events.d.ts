import type { WebSocketServer } from "ws";

import type { GameObjectName, Server } from "./GameObjects";
import type { Player } from "./Player";
import type { Room } from "./Room";

// properties that are not event-specific
export type EventHandlerContext = {
  socketServer: WebSocketServer;
  players: Map<string, Player>;
  rooms: Map<string, Room>;
};

// properties common to all events
export type CommonEvent = {
  eventName: keyof AppEvents;
  roomID: string;
  playerID?: string;
};

// properties common to all player-related events
export type PlayerEvent = CommonEvent;

// properties common to all game-object-related events
export type GameObjectEvent = CommonEvent & {
  gameObjectType: GameObjectTypes;
  gameObjectID: string;
};

export type AppEvents = {
  // Player Events
  PlayerJoined: PlayerEvent;
  PlayerLeft: PlayerEvent;
  PlayerBecameHost: PlayerEvent & { newHostID: string };

  // Game Object Events
  GameObjectCreated: GameObjectEvent & {
    objectData: Server.AnyGameObjectData;
  };
  GameObjectDeleted: GameObjectEvent;
  GameObjectMoved: GameObjectEvent & {
    x: number;
    y: number;
  };
  GameObjectRotated: GameObjectEvent & {
    angle: number;
  };
  GameObjectFlipped: GameObjectEvent & {
    isFaceUp: boolean;
  };
  GameObjectCopied: GameObjectEvent & {
    newGameObjectID: string;
    x: number;
    y: number;
  };

  // Deck Specific Events
  DeckInsertedCard: GameObjectEvent & {
    gameObjectType: "Deck";
    cardID: string;
    index: number;
  };
  DeckRemovedCard: GameObjectEvent & {
    gameObjectType: "Deck";
    index: number;
  };
  DeckReordered: GameObjectEvent & {
    gameObjectType: "Deck";
    indices: number[];
  };

  // Counter Specific Events
  CounterUpdated: GameObjectEvent & {
    gameObjectType: "Counter";
    val: number;
  };
};

export interface EventHandler<E extends keyof AppEvents> {
  (event: AppEvents[E]): void;
}

export type AnyEvent = AppEvents[keyof AppEvents];

export type EventHandlerTable = {
  [event in keyof AppEvents]: EventHandler<event>;
};
