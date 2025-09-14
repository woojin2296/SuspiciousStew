import * as Phaser from "phaser";

export class Key {
  static readonly TEXTURE_PATH = "/texture/Key.png";
  static readonly TEXTURE_KEY = "texture.Key";

  static readonly TILE_WIDTH = 16;
  static readonly TILE_HEIGHT = 16;

  static load(scene: Phaser.Scene) {
    scene.load.spritesheet(this.TEXTURE_KEY, this.TEXTURE_PATH, { frameWidth: this.TILE_WIDTH, frameHeight: this.TILE_HEIGHT });
  }
  static registerAnims(scene: Phaser.Scene) { /* none */ }

  private scene: Phaser.Scene;
  private entity: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, pos: { col: number, row: number }) {
    this.scene = scene;
    this.entity = scene.add
      .sprite(16 * pos.col, 16 * pos.row, Key.TEXTURE_KEY, 0)
      .setOrigin(0, 0)
      .setDepth(5_000);
  }

  public async moveTo(pos: { col: number, row: number }): Promise<void> {
    return new Promise<void>((res) => {
      this.scene.tweens.add({
        targets: this.entity,
        x: 16 * pos.col,
        y: 16 * pos.row,
        duration : 200,
        ease: "Sine.easeInOut",
        onComplete: () => {
          res();
        },
      });
    });
  }

  public restore() {
    this.entity.setFrame(0);
  }
  
  public taken() {
    this.entity.setFrame(1);
  }
}
