import type { WebSocketServer } from "ws";

import type { GameObjectType, Server } from "./GameObjects";
import type { Player } from "./Player";
import type { Room } from "./Room";

export type EventName =
  | "PlayerJoined"
  | "PlayerLeft"
  | "PlayerBecameHost"
  | "GameObjectCreated"
  | "GameObjectDeleted"
  | "GameObjectMoved"
  | "GameObjectRotated"
  | "GameObjectFlipped"
  | "GameObjectCopied"
  | "DeckInsertedCard"
  | "DeckRemovedCard"
  | "DeckReordered"
  | "CounterUpdated";

// properties that are not event-specific
export type EventContext = {
  players: Map<string, Player>;
  rooms: Map<string, Room>;
};

// properties common to all events
export type CommonEvent = {
  eventName: EventName;
  roomID: string;
  playerID: string;
};

// properties common to all player-related events
export type PlayerEvent = CommonEvent;

// properties common to all game-object-related events
export type GameObjectEvent = CommonEvent & {
  gameObjectType: GameObjectType;
  gameObjectID: string;
};

export type EventData<E extends EventName = EventName> = {
  // Player Events
  PlayerJoined: PlayerEvent;
  PlayerLeft: PlayerEvent;
  PlayerBecameHost: PlayerEvent & { newHostID: string };

  // Game Object Events
  GameObjectCreated: GameObjectEvent & Server.GameObject;
  GameObjectDeleted: GameObjectEvent;
  GameObjectMoved: GameObjectEvent & Pick<Server.GameObject, "x" | "y">;
  GameObjectRotated: GameObjectEvent & Pick<Server.GameObject, "angle">;
  GameObjectFlipped: GameObjectEvent & Pick<Server.GameObject, "isFaceUp">;
  GameObjectCopied: GameObjectEvent & Pick<Server.GameObject, "x" | "y">;

  // Deck Specific Events
  DeckInsertedCard: GameObjectEvent & {
    gameObjectType: "Deck";
    scryfallID: string;
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
}[E];

export type EventHandler<E extends EventName = EventName> = (
  event: EventData<E>
) => void;

export type EventHandlerTable = {
  [E in EventName]: EventHandler<E>;
};
