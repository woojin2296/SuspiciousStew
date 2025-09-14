import * as Phaser from "phaser";

export class Door {
  static readonly TEXTURE_PATH = "/texture/Door.png";
  static readonly TEXTURE_KEY = "texture.Door";

  static readonly TILE_WIDTH = 16;
  static readonly TILE_HEIGHT = 16;

  static load(scene: Phaser.Scene) {
    scene.load.spritesheet(this.TEXTURE_KEY, this.TEXTURE_PATH, { frameWidth: this.TILE_WIDTH, frameHeight: this.TILE_HEIGHT });
  }
  static registerAnims(scene: Phaser.Scene) { /* none */ }

  private scene: Phaser.Scene;
  private entity: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, pos: { col: number, row: number }, hasKey: boolean = false) {
    this.scene = scene;
    this.entity = scene.add
      .sprite(16 * pos.col, 16 * pos.row, Door.TEXTURE_KEY, 0)
      .setOrigin(0, 0)
      .setDepth(5_000);
    if (hasKey) {
      this.open();
    }
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

  public open() {
    this.entity.setFrame(1);
  }
  
  public close() {
    this.entity.setFrame(0);
  }
}
