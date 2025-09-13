import * as Phaser from "phaser";
import { BaseEntity } from "@/game/entity/BaseEntity";

export class Slime extends BaseEntity {
  constructor(scene: Phaser.Scene, tileSize: number, canPass: (c: number, r: number) => boolean) {
    super(scene, tileSize, canPass);
  }

  spawnAt(col: number, row: number, color = 0x8b5cf6) {
    super.spawnAt(col, row, color, 0x5b21b6, 9_999);
  }

  async react(duration = 90): Promise<boolean> {
    // Try move right, otherwise left
    if (await this.tryStep(1, 0, duration)) return true;
    if (await this.tryStep(-1, 0, duration)) return true;
    return false;
  }
}

