import Phaser from "phaser";
import { Client } from "../models";
import { fetchScryfallCardData } from "./utils/card-importer";
import { handleMouseDrag } from "./event-handlers/phaser";
import { ScryfallCardData } from "../models";

const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
  socket.send("conk");
};

const cards: Map<string, Client.GameObjects["Card"]> = new Map();

const preload: Phaser.Types.Scenes.ScenePreloadCallback = function () {};

const create: Phaser.Types.Scenes.SceneCreateCallback = function () {
  this.input.on("drag", handleMouseDrag);

  const loadCardData = (
    data: ScryfallCardData,
    spawnX: number = this.scale.width / 2,
    spawnY: number = this.scale.height / 2
  ) => {
    const { id } = data;
    const sprite = this.add.image(spawnX, spawnY, id);
    this.load
      .image(id, data.image_uris!.png!)
      .once(Phaser.Loader.Events.COMPLETE, () => {
        sprite.setTexture(id).setScale(0.3).setInteractive();
        this.input.setDraggable(sprite);
      })
      .start();
    cards.set(id, { sprite, data });
  };

  const importCard = (cardName: string) =>
    fetchScryfallCardData(cardName).then(loadCardData);

  importCard("forest");
};

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    height: "100vh",
    width: "100vw",
  },
  scene: { preload, create },
});
