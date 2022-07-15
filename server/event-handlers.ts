import {
  CommonEvent,
  EventContext,
  EventData,
  EventName,
  GameObjectEvent,
  GameObjectName,
  Server,
} from "../models";

export const eventHandlers: {
  [ev in EventName]: (ctx: EventContext, data: EventData[ev]) => void;
} = {
  PlayerJoined: function (ctx: EventContext, data: CommonEvent): void {
    throw new Error("Function not implemented.");
  },
  PlayerLeft: function (ctx: EventContext, data: CommonEvent): void {
    throw new Error("Function not implemented.");
  },
  NewHost: function (
    ctx: EventContext,
    data: CommonEvent & { newHostID: string }
  ): void {
    throw new Error("Function not implemented.");
  },
  RoomChangedSize: function (
    ctx: EventContext,
    data: CommonEvent & { newRoomSize: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  RoomLocked: function (ctx: EventContext, data: CommonEvent): void {
    throw new Error("Function not implemented.");
  },
  RoomUnlocked: function (ctx: EventContext, data: CommonEvent): void {
    throw new Error("Function not implemented.");
  },
  RoomEnabledPassword: function (
    ctx: EventContext,
    data: CommonEvent & { passwordHash: string }
  ): void {
    throw new Error("Function not implemented.");
  },
  RoomDisabledPassword: function (ctx: EventContext, data: CommonEvent): void {
    throw new Error("Function not implemented.");
  },
  RoomChangedPassword: function (
    ctx: EventContext,
    data: CommonEvent & { passwordHash: string }
  ): void {
    throw new Error("Function not implemented.");
  },
  GameObjectDeleted: function (ctx: EventContext, data: GameObjectEvent): void {
    throw new Error("Function not implemented.");
  },
  GameObjectMoved: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { x: number; y: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  GameObjectRotated: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { angle: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  GameObjectFlipped: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { isFaceUp: boolean }
  ): void {
    throw new Error("Function not implemented.");
  },
  GameObjectCopied: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { newGameObjectID: string; x: number; y: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  CardCreated: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Card" } & { scryfallID: string }
  ): void {
    throw new Error("Function not implemented.");
  },
  DeckCreated: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Deck" } & { scryfallIDs: string[] }
  ): void {
    throw new Error("Function not implemented.");
  },
  DeckInsertedCard: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Deck" } & { cardID: string; index: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  DeckRemovedCard: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Deck" } & { index: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  DeckReordered: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Deck" } & { indices: number[] }
  ): void {
    throw new Error("Function not implemented.");
  },
  CounterCreated: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Counter" } & { val: number }
  ): void {
    throw new Error("Function not implemented.");
  },
  CounterUpdated: function (
    ctx: EventContext,
    data: CommonEvent & {
      gameObjectName: GameObjectName;
      gameObjectID: string;
    } & { gameObjectName: "Counter" } & { val: number }
  ): void {
    throw new Error("Function not implemented.");
  },
};
