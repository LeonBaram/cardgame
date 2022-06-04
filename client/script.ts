import Phaser from "phaser";

const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
  socket.send("conk");
};

const preload: Phaser.Types.Scenes.ScenePreloadCallback = function () {};

const create: Phaser.Types.Scenes.SceneCreateCallback = function () {
  const card = this.add.image(500, 500, "card");
  this.load.image(
    "card",
    "https://c1.scryfall.com/file/scryfall-cards/large/front/a/4/a457f404-ddf1-40fa-b0f0-23c8598533f4.jpg?1645328634"
  );

  this.load.once(Phaser.Loader.Events.COMPLETE, () => {
    card.setTexture("card").setInteractive();
    this.input.setDraggable(card).on("drag", handleEventMouseDrag);
  });

  this.load.start();
};

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: { preload, create },
});

function handleEventMouseDrag(
  mousePointer: Phaser.Input.Pointer,
  gameObject: Phaser.GameObjects.Image,
  dragX: number,
  dragY: number
): void {
  gameObject.x = dragX;
  gameObject.y = dragY;
}
