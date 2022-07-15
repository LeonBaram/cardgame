import type { WebSocketServer } from "ws";

import type { GameObjectName, Server } from "./GameObjects";
import type { Player } from "./Player";
import type { Room } from "./Room";

export type EventName =
  // Room Events
  | "PlayerJoined"
  | "PlayerLeft"
  | "NewHost"
  | "RoomChangedSize"
  | "RoomLocked"
  | "RoomUnlocked"
  | "RoomEnabledPassword"
  | "RoomDisabledPassword"
  | "RoomChangedPassword"
  // Game Object Events
  | "GameObjectDeleted"
  | "GameObjectMoved"
  | "GameObjectRotated"
  | "GameObjectFlipped"
  | "GameObjectCopied"
  // Card Specific Events
  | "CardCreated"
  // Deck Specific Events
  | "DeckCreated"
  | "DeckInsertedCard"
  | "DeckRemovedCard"
  | "DeckReordered"
  // Counter Specific Events
  | "CounterCreated"
  | "CounterUpdated";

export type EventContext = {
  socketServer: WebSocketServer;
  players: Map<string, Player>;
  playerID: string;
  rooms: Map<string, Room>;
  roomID: string;
};

// common event interface
export type CommonEvent = {
  eventName: EventName;
};

export type RoomEvent = CommonEvent;

export type GameObjectEvent = CommonEvent & {
  gameObjectName: GameObjectName;
  gameObjectID: string;
};

export type CardEvent = GameObjectEvent & { gameObjectName: "Card" };
export type DeckEvent = GameObjectEvent & { gameObjectName: "Deck" };
export type CounterEvent = GameObjectEvent & { gameObjectName: "Counter" };

export type EventData = {
  // Room Events
  PlayerJoined: RoomEvent;
  PlayerLeft: RoomEvent;
  NewHost: RoomEvent & { newHostID: string };
  RoomChangedSize: RoomEvent & { newRoomSize: number };
  RoomLocked: RoomEvent;
  RoomUnlocked: RoomEvent;
  RoomEnabledPassword: RoomEvent & { passwordHash: string };
  RoomDisabledPassword: RoomEvent;
  RoomChangedPassword: RoomEvent & { passwordHash: string };

  // Game Object Events
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

  // Card Specific Events
  CardCreated: CardEvent & Server.GameObjectData["Card"];

  // Deck Specific Events
  DeckCreated: DeckEvent & Server.GameObjectData["Deck"];
  DeckInsertedCard: DeckEvent & {
    cardID: string;
    index: number;
  };
  DeckRemovedCard: DeckEvent & {
    index: number;
  };
  DeckReordered: DeckEvent & {
    indices: number[];
  };

  // Counter Specific Events
  CounterCreated: CounterEvent & Server.GameObjectData["Counter"];
  CounterUpdated: CounterEvent & {
    val: number;
  };
};
