import type { Client } from "../models";
import { scryfallFetch } from "./utils/card-importer";

interface PhaserDragListener {
  (
    this: Phaser.Scene,
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.Image,
    x: number,
    y: number
  ): void;
}

interface PhaserWheelListener {
  (
    this: Phaser.Scene,
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
    deltaZ: number
  ): void;
}

let cameraControls: Phaser.Cameras.Controls.SmoothedKeyControl;

const game = new Phaser.Game({
  canvas: document.querySelector("#game-area") as HTMLCanvasElement,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    height: "80vh",
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

      const { KeyCodes } = Phaser.Input.Keyboard;
      const { W, A, S, D } = KeyCodes;

      const addKey = (keyCode: number) => keyboard.addKey(keyCode);

      cameraControls = new Phaser.Cameras.Controls.SmoothedKeyControl({
        camera,
        up: addKey(W),
        left: addKey(A),
        down: addKey(S),
        right: addKey(D),
        acceleration: 0.06,
        drag: 0.0005,
        maxSpeed: 1,
      });

      const zoomCamera: PhaserWheelListener = (_ptr, _objs, _dx, dy, _dz) => {
        camera.zoom -= 0.1 * Math.sign(dy);
      };
      this.input.on("wheel", zoomCamera);

      this.add.image(0, 0, "table").setOrigin(0, 0);

      const moveObject: PhaserDragListener = (_ptr, obj, x, y) => {
        obj.x = x;
        obj.y = y;
      };
      this.input.on("drag", moveObject);

      const cardName = "island";
      const id = "bepis";
      const x = this.scale.width / 2;
      const y = this.scale.height / 2;
      const data = await scryfallFetch({ cardName });
      const sprite = this.add.image(x, y, id);
      const uri =
        data.image_uris?.png ??
        data.image_uris?.large ??
        data.image_uris?.normal ??
        data.image_uris?.small ??
        null;

      if (uri === null) {
        throw "TODO: load placeholder";
      }

      this.load
        .image(id, uri)
        .once(Phaser.Loader.Events.COMPLETE, () => {
          sprite.setTexture(id).setScale(0.3).setInteractive();
          this.input.setDraggable(sprite);
        })
        .start();

      const island = <Client.Card>{ sprite, data, gameObjectName: "Card" };
    },
    update(_time: number, delta: number) {
      cameraControls.update(delta);
    },
  },
} as Phaser.Types.Core.GameConfig);
