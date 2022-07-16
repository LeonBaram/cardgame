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

export namespace Events {
  type Context = {
    socketServer: WebSocketServer;
    players: Map<string, Player>;
    rooms: Map<string, Room>;
    playerID: string;
    roomID: string;
  };

  type RoomEvent = {};

  type GameObjectEvent<G extends GameObjectName = GameObjectName> = {
    gameObjectID: string;
    gameObjectName: G;
  };

  type GameObjectCreated<G extends GameObjectName> = GameObjectEvent<G> &
    Server.GameObjectData<G>;

  type Data<E extends EventName> = { eventName: E } & {
    // Room Events
    PlayerJoined: RoomEvent & {
      newPlayerID?: string;
      room?: Room;
    };
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
      newGameObjectID?: string;
      x: number;
      y: number;
    };

    // Card Specific Events
    CardCreated: GameObjectCreated<"Card">;

    // Deck Specific Events
    DeckCreated: GameObjectCreated<"Deck">;
    DeckInsertedCard: GameObjectEvent<"Deck"> & {
      cardID: string;
      index: number;
    };
    DeckRemovedCard: GameObjectEvent<"Deck"> & {
      index: number;
    };
    DeckReordered: GameObjectEvent<"Deck"> & {
      indices: number[];
    };

    // Counter Specific Events
    CounterCreated: GameObjectCreated<"Counter">;
    CounterUpdated: GameObjectEvent<"Counter"> & {
      val: number;
    };
  }[E];
}
