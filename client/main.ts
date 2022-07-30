import type { Client, ScryfallCardData } from "../models";
import {
  ApiFetcher,
  scryfallFetchByID,
  scryfallFetchByName,
} from "./utils/card-importers";

// expected args for phaser event handling callbacks
// sources:
//  - https://newdocs.phaser.io/docs/3.52.0/Phaser.Input.Events
//  - https://newdocs.phaser.io/docs/3.52.0/Phaser.Loader.Events
namespace InputHandlers {
  export interface Drag {
    (
      this: Phaser.Scene,
      pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Image,
      x: number,
      y: number
    ): void;
  }

  export interface Wheel {
    (
      this: Phaser.Scene,
      pointer: Phaser.Input.Pointer,
      currentlyOver: Phaser.GameObjects.GameObject[],
      deltaX: number,
      deltaY: number,
      deltaZ: number
    ): void;
  }

  export interface PointerDown {
    (
      this: Phaser.Scene,
      pointer: Phaser.Input.Pointer,
      currentlyOver: Phaser.GameObjects.GameObject[]
    ): void;
  }
}

namespace LoaderHandlers {
  export interface Complete {
    (
      this: Phaser.Scene,
      loader: Phaser.Loader.LoaderPlugin,
      totalComplete: number,
      totalFailed: number
    ): void;
  }
}

let cameraControls: Phaser.Cameras.Controls.SmoothedKeyControl;

const game = new Phaser.Game({
  canvas: document.querySelector("#game-area") as HTMLCanvasElement,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    height: "100vh",
    width: "100vw",
  },
  scene: {
    preload() {
      this.load.image(
        "cardback",
        "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg"
      );
      this.load.image(
        "table",
        "https://external-preview.redd.it/Ru-kfHZ0G2rMjdO1XyXlMtygSrD_gQxszY3bF_9h2sY.jpg?auto=webp&s=1b892dce4331223544327bd067cefaeebb1cea3c"
      );
    },
    async create() {
      const camera = this.cameras.main;

      const { keyboard } = this.input;
      const { W, A, S, D } = Phaser.Input.Keyboard.KeyCodes;

      cameraControls = new Phaser.Cameras.Controls.SmoothedKeyControl({
        camera,
        up: keyboard.addKey(W),
        left: keyboard.addKey(A),
        down: keyboard.addKey(S),
        right: keyboard.addKey(D),
        acceleration: 0.06,
        drag: 0.0005,
        maxSpeed: 1,
      });

      type ScrollHandler = InputHandlers.Wheel;
      const zoomCamera: ScrollHandler = (_ptr, _objs, _dx, dy, _dz) => {
        camera.zoom -= 0.1 * Math.sign(dy);
      };
      this.input.on("wheel", zoomCamera);

      const { width, height } = this.scale;
      const centerX = width / 2;
      const centerY = height / 2;

      const table = this.add.image(centerX, centerY, "table");
      table.setScale(Math.min(width / table.width, height / table.height));

      const moveObject: InputHandlers.Drag = (_ptr, obj, x, y) => {
        obj.x = x;
        obj.y = y;
      };
      this.input.on("drag", moveObject);

      const bringToFront: InputHandlers.PointerDown = (_ptr, objs) => {
        this.children.bringToTop(objs[0]);
      };
      this.input.on("pointerdown", bringToFront);

      importCardsByName(this, ...Array(100).fill("island"));
    },
    update(_time: number, delta: number) {
      cameraControls.update(delta);
    },
  },
} as Phaser.Types.Core.GameConfig);

type CardImporter = (
  fetchCardData: ApiFetcher,
  scene: Phaser.Scene,
  ...queries: string[]
) => Promise<Client.Card[]>;

const importCards: CardImporter = async (fetchCardData, scene, ...queries) => {
  const results = await Promise.allSettled(queries.map(fetchCardData));
  const cardData: ScryfallCardData[] = [];
  for (const res of results) {
    if (res.status === "fulfilled" && res.value.object !== "error") {
      const data = res.value;

      const { id } = data;

      const uri =
        data.image_uris?.png ??
        data.image_uris?.large ??
        data.image_uris?.normal ??
        data.image_uris?.small ??
        null;

      if (!scene.textures.exists(id) && uri !== null) {
        scene.load.image(id, uri);
      }

      cardData.push(data);
    } else if (res.status === "rejected") {
      console.log("rejected; reason:", res.reason);
    } else if (res.value.object === "error") {
      console.log(res.value.details ?? { error: res.value });
    }
  }

  console.log({ results, cardData });

  const cards: Client.Card[] = [];

  const spawnCards: LoaderHandlers.Complete = () => {
    for (const data of cardData) {
      const { id } = data;

      const uri =
        data.image_uris?.png ??
        data.image_uris?.large ??
        data.image_uris?.normal ??
        data.image_uris?.small ??
        null;

      const sprite = scene.add
        .image(0, 0, uri ? id : "cardback")
        .setTexture(id)
        .setScale(0.3)
        .setInteractive()
        .setRandomPosition();
      scene.input.setDraggable(sprite);

      cards.push({ sprite, data, gameObjectName: "Card" });
    }
  };
  scene.load.once("complete", spawnCards).start();

  return cards;
};

const importCardsByName = (scene: Phaser.Scene, ...queries: string[]) =>
  importCards(scryfallFetchByName, scene, ...queries);

const importCardsByID = (scene: Phaser.Scene, ...queries: string[]) =>
  importCards(scryfallFetchByID, scene, ...queries);
