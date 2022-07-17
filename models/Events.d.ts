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
  | "GameObjectCreated"
  | "GameObjectDeleted"
  | "GameObjectMoved"
  | "GameObjectRotated"
  | "GameObjectFlipped"
  // Deck Specific Events
  | "DeckInsertedCard"
  | "DeckRemovedCard"
  | "DeckRearranged"
  // Counter Specific Events
  | "CounterUpdated";

export namespace Events {
  type Context = {
    socketServer: WebSocketServer;
    players: Map<string, Player>;
    rooms: Map<string, Room<"Server">>;
    playerID: string;
    roomID: string;
  };

  type Handler<E extends EventName> = (ctx: Context, data: Data<E>) => boolean;

  type RoomEvent = {};

  type GameObjectEvent<G extends GameObjectName = GameObjectName> = {
    gameObjectID: string;
    gameObjectName: G;
  };

  type GameObjectCreated<G extends GameObjectName> = GameObjectEvent<G> &
    Server.GameObjectData<G>;

  type Data<E extends EventName> = { eventName: E } & {
    // Room Events
    PlayerJoined: RoomEvent &
      ({ newPlayerID: string } | { room: Room<"Server"> });
    PlayerLeft: RoomEvent;
    NewHost: RoomEvent & { newHostID: string };
    RoomChangedSize: RoomEvent & { newRoomSize: number };
    RoomLocked: RoomEvent;
    RoomUnlocked: RoomEvent;
    RoomEnabledPassword: RoomEvent & { passwordHash: string };
    RoomDisabledPassword: RoomEvent;
    RoomChangedPassword: RoomEvent & { passwordHash: string };

    // Game Object Events
    GameObjectCreated: GameObjectEvent & {
      gameObject: Server.GameObject<GameObjectName>;
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

    // Deck Specific Events
    DeckInsertedCard: GameObjectEvent<"Deck"> & {
      scryfallID: string;
      index: number;
    };
    DeckRemovedCard: GameObjectEvent<"Deck"> & {
      index: number;
    };
    DeckRearranged: GameObjectEvent<"Deck"> & {
      indices: number[];
    };

    // Counter Specific Events
    CounterUpdated: GameObjectEvent<"Counter"> & {
      val: number;
    };
  }[E];
}
