const game = new Phaser.Game({
  canvas: document.querySelector("#game-area") as HTMLCanvasElement,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    height: "80vh",
    width: "100vw",
  },
});
