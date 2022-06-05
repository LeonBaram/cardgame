import type { WebSocket } from "ws";
import type { GameObjectType } from "./GameObjects";

export type EventData = {
  event: string;
  socket: WebSocket;
  roomID: string;
};

export type PlayerEvent = EventData & {
  playerID: string;
};

export type GameObjectEvent = EventData & {
  gameObjectID: string;
  gameObjectType: GameObjectType;
};

export type EventTypes = {
  // Player Events
  PlayerJoined: PlayerEvent & {
    event: "PlayerJoined";
  };
  PlayerLeft: PlayerEvent & {
    event: "PlayerLeft";
  };
  PlayerBecameHost: PlayerEvent & {
    event: "PlayerBecameHost";
  };

  // Game Object Events
  GameObjectCreated: GameObjectEvent & {
    event: "GameObjectCreated";
  };
  GameObjectDeleted: GameObjectEvent & {
    event: "GameObjectDeleted";
  };
  GameObjectMoved: GameObjectEvent & {
    event: "GameObjectMoved";
    x: number;
    y: number;
  };
  GameObjectRotated: GameObjectEvent & {
    event: "GameObjectRotated";
    angle: number;
  };
  GameObjectFlipped: GameObjectEvent & {
    event: "GameObjectFlipped";
    faceUp: boolean;
  };
  GameObjectCopied: GameObjectEvent & {
    event: "GameObjectCopied";
    x: number;
    y: number;
    angle: number;
  };

  // Deck Specific Events
  DeckInsertedCard: GameObjectEvent & {
    event: "DeckInsertedCard";
    gameObjectType: "Deck";
    index: number;
    cardID: string;
  };
  DeckRemovedCard: GameObjectEvent & {
    event: "DeckRemovedCard";
    gameObjectType: "Deck";
    index: number;
  };
  DeckReordered: GameObjectEvent & {
    event: "DeckReordered";
    gameObjectType: "Deck";
    indices: number[];
  };

  // Counter Specific Events
  CounterUpdated: GameObjectEvent & {
    event: "CounterUpdated";
    gameObjectType: "Counter";
    val: number;
  };
};

export type WebSocketEventData = EventTypes[keyof EventTypes];

export type EventHandlers = {
  [event in keyof EventTypes]: (args: EventTypes[event]) => void;
};
