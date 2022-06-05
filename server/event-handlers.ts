import type { EventHandlers } from "../models/Events";

export const eventHandlers: EventHandlers = {
  JoinRequested: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  PlayerJoined: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  PlayerLeft: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  PlayerBecameHost: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectCreated: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectDeleted: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectMoved: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectRotated: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectFlipped: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  GameObjectCopied: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  DeckInsertedCard: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  DeckRemovedCard: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  DeckReordered: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
  CounterUpdated: ({ ...args }): void => {
    throw new Error("Function not implemented.");
  },
};
