import { WebSocketServer } from "ws";
import {
  EventContext,
  EventData,
  EventValidatorTable,
  Player,
  Room,
} from "../models";

export class EventValidatorFactory
  implements EventValidatorTable, EventContext
{
  constructor(
    readonly socketServer: WebSocketServer,
    readonly players: Map<string, Player>,
    readonly rooms: Map<string, Room>
  ) {}

  private roomID(event: EventData): void {}

  PlayerJoined(event: EventData<"PlayerJoined">): void {}

  PlayerLeft(event: EventData<"PlayerLeft">): void {}

  PlayerBecameHost(event: EventData<"PlayerBecameHost">): void {}

  GameObjectCreated(event: EventData<"GameObjectCreated">): void {}

  GameObjectDeleted(event: EventData<"GameObjectDeleted">): void {}

  GameObjectMoved(event: EventData<"GameObjectMoved">): void {}

  GameObjectRotated(event: EventData<"GameObjectRotated">): void {}

  GameObjectFlipped(event: EventData<"GameObjectFlipped">): void {}

  GameObjectCopied(event: EventData<"GameObjectCopied">): void {}

  DeckInsertedCard(event: EventData<"DeckInsertedCard">): void {}

  DeckRemovedCard(event: EventData<"DeckRemovedCard">): void {}

  DeckReordered(event: EventData<"DeckReordered">): void {}

  CounterUpdated(event: EventData<"CounterUpdated">): void {}
}
