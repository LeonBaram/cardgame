import type { Client } from "../models";
import { scryfallFetch } from "./utils/card-importer";

function handleMouseDrag(
  _pointer: Phaser.Input.Pointer,
  gameObject: Phaser.GameObjects.Image,
  x: number,
  y: number
): void {
  gameObject.x = x;
  gameObject.y = y;
}

const game = new Phaser.Game({
  canvas: document.querySelector("#game-area") as HTMLCanvasElement,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    height: "80vh",
    width: "100vw",
  },
  scene: {
    async preload() {},
    async create() {
      this.input.on("drag", handleMouseDrag);
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
  },
});
