import Phaser from "phaser";

const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
  socket.send("conk");
};

const preload: Phaser.Types.Scenes.ScenePreloadCallback = function () {
  this.load.image({
    key: "card",
    url: "/assets/card.jpg",
    extension: "jpg",
  });
};

const create: Phaser.Types.Scenes.SceneCreateCallback = function () {
  const image: Phaser.GameObjects.Image = this.add.image(100, 100, "card");

  image.setInteractive();

  this.input.setDraggable(image);

  this.input.on("drag", handleEventMouseDrag);
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
