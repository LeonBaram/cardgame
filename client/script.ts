import Phaser from "phaser";

const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
  socket.send("conk");
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-area",
  width: 1920,
  height: 1080,
  scene: {
    preload: function () {
      this.load.atlas("card", "assets/card.jpg");
    },
    create: function () {},
  },
});
