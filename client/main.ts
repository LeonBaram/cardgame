import type { Client } from "../models";
import { scryfallFetch } from "./utils/card-importer";

// expected args for phaser event handling callbacks
// sources:
//  - https://newdocs.phaser.io/docs/3.52.0/Phaser.GameObjects.Events
//  - https://newdocs.phaser.io/docs/3.52.0/Phaser.Loader.Events
namespace PhaserHandlers {
  export interface MouseDrag {
    (
      this: Phaser.Scene,
      pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Image,
      x: number,
      y: number
    ): void;
  }

  export interface MouseWheel {
    (
      this: Phaser.Scene,
      pointer: Phaser.Input.Pointer,
      currentlyOver: Phaser.GameObjects.GameObject[],
      deltaX: number,
      deltaY: number,
      deltaZ: number
    ): void;
  }

  export interface LoaderComplete {
    (
      this: Phaser.Scene,
      loader: Phaser.Loader.LoaderPlugin,
      totalComplete: number,
      totalFailed: number
    ): void;
  }
}

let cameraControls: Phaser.Cameras.Controls.SmoothedKeyControl;

const assetURIs = {
  cardback:
    "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg",
  table:
    "https://external-preview.redd.it/Ru-kfHZ0G2rMjdO1XyXlMtygSrD_gQxszY3bF_9h2sY.jpg?auto=webp&s=1b892dce4331223544327bd067cefaeebb1cea3c",
};

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
      for (const name in assetURIs) {
        this.load.image(name, assetURIs[name]);
      }
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

      type ScrollHandler = PhaserHandlers.MouseWheel;
      const zoomCamera: ScrollHandler = (_ptr, _objs, _dx, dy, _dz) => {
        camera.zoom -= 0.1 * Math.sign(dy);
      };
      this.input.on("wheel", zoomCamera);

      const { width, height } = this.scale;
      const centerX = width / 2;
      const centerY = height / 2;

      const table = this.add.image(centerX, centerY, "table");
      table.setScale(Math.min(width / table.width, height / table.height));

      const moveObject: PhaserHandlers.MouseDrag = (_ptr, obj, x, y) => {
        obj.x = x;
        obj.y = y;
      };
      this.input.on("drag", moveObject);

      const cards = ["island", "forest"];
      await Promise.allSettled(cards.map((card) => loadCard(this, card)));
    },
    update(_time: number, delta: number) {
      cameraControls.update(delta);
    },
  },
} as Phaser.Types.Core.GameConfig);

async function loadCard(
  scene: Phaser.Scene,
  cardName: string,
  id?: string
): Promise<Client.Card> {
  id ??= Math.random().toString();

  const data = await scryfallFetch({ cardName });
  const sprite = scene.add.image(0, 0, id);

  const uri =
    data.image_uris?.png ??
    data.image_uris?.large ??
    data.image_uris?.normal ??
    data.image_uris?.small ??
    assetURIs.cardback;

  const spawnCard: PhaserHandlers.LoaderComplete = () => {
    sprite.setTexture(id!).setRandomPosition().setScale(0.3).setInteractive();
    scene.input.setDraggable(sprite);
  };

  scene.load.image(id, uri).once("complete", spawnCard).start();

  return <Client.Card>{ data, sprite, gameObjectName: "Card" };
}
