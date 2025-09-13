import * as Phaser from "phaser";
import { BaseEntity, Dir } from "@/game/entity/BaseEntity";

export class Player extends BaseEntity {
  constructor(scene: Phaser.Scene, tileSize: number, canPass: (c: number, r: number) => boolean) {
    super(scene, tileSize, canPass);
  }

  spawnAt(col: number, row: number, color = 0x6ee7b7) {
    super.spawnAt(col, row, color, 0x065f46, 10_000);
  }

  async tryMove(dir: Dir, duration = 90): Promise<boolean> {
    return super.tryMove(dir, duration);
  }
}
