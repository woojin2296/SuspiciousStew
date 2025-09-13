import * as Phaser from "phaser";

export type Dir = "left" | "right" | "up" | "down";

export class BaseEntity {
  protected scene: Phaser.Scene;
  protected tileSize: number;
  protected canPass: (c: number, r: number) => boolean;

  protected rect!: Phaser.GameObjects.Rectangle;
  protected col = 0;
  protected row = 0;
  protected moving = false;

  constructor(scene: Phaser.Scene, tileSize: number, canPass: (c: number, r: number) => boolean) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.canPass = canPass;
  }

  spawnAt(col: number, row: number, color = 0xffffff, stroke = 0x000000, depth = 10_000) {
    this.col = col;
    this.row = row;
    const { x, y } = this.gridToWorld(col, row);
    this.rect = this.scene.add
      .rectangle(x, y, this.tileSize * 0.7, this.tileSize * 0.7, color)
      .setStrokeStyle(2, stroke)
      .setDepth(depth);
  }

  isBusy() { return this.moving; }
  getCol() { return this.col; }
  getRow() { return this.row; }
  getDisplay(): Phaser.GameObjects.Rectangle { return this.rect; }

  async tryMove(dir: Dir, duration = 90): Promise<boolean> {
    const d = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] } as const;
    const [dx, dy] = d[dir];
    return this.tryStep(dx, dy, duration);
  }

  protected async tryStep(dx: number, dy: number, duration = 90): Promise<boolean> {
    if (this.moving || !this.rect) return false;
    const nc = this.col + dx;
    const nr = this.row + dy;
    if (!this.canPass(nc, nr)) return false;
    await this.moveTo(nc, nr, duration);
    return true;
  }

  protected async moveTo(col: number, row: number, duration = 90): Promise<void> {
    const { x, y } = this.gridToWorld(col, row);
    this.moving = true;
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.rect,
        x, y,
        duration,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
    this.col = col;
    this.row = row;
    this.moving = false;
  }

  protected gridToWorld(col: number, row: number) {
    return { x: col * this.tileSize + this.tileSize / 2, y: row * this.tileSize + this.tileSize / 2 };
  }
}

