import Phaser from "phaser";
import type { ScryfallCardData } from "./external/ScryfallCardData";

export interface Card {
  readonly data: ScryfallCardData;
  readonly sprite: Phaser.GameObjects.Image;
}
