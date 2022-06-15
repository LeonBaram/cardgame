import Phaser from "phaser";

export function handleMouseDrag(
  _pointer: Phaser.Input.Pointer,
  gameObject: Phaser.GameObjects.Image,
  dragX: number,
  dragY: number
): void {
  gameObject.x = dragX;
  gameObject.y = dragY;
}
