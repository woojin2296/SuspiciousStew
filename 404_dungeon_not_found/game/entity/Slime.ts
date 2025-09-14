import * as Phaser from "phaser";

export class Slime {
  static readonly TEXTURE_PATH = "/texture/Slime.png";
  static readonly TEXTURE_KEY = "texture.Slime";

  static readonly ANIM_IDLE = { key: "slime.anim.idle", start: 0, end: 1, frameRate: 3, repeat: -1 };

  static load(scene: Phaser.Scene) {
    scene.load.spritesheet(Slime.TEXTURE_KEY, Slime.TEXTURE_PATH, { frameWidth: 16, frameHeight: 16 });
  }

  static registerAnims(scene: Phaser.Scene) { 
    const mk = (key: string, cfg: Phaser.Types.Animations.Animation) => !scene.anims.exists(key) && scene.anims.create({ key, ...cfg });
    mk(this.ANIM_IDLE.key, { frames: scene.anims.generateFrameNumbers(this.TEXTURE_KEY, { start: this.ANIM_IDLE.start, end: this.ANIM_IDLE.end }), frameRate: this.ANIM_IDLE.frameRate, repeat: this.ANIM_IDLE.repeat });
  }


  private scene: Phaser.Scene;
  private entity: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, pos: { col: number, row: number }) {
    this.scene = scene;
    this.entity = this.scene.add
      .sprite(16 * pos.col, 16 * pos.row, Slime.TEXTURE_KEY)
      .play(Slime.ANIM_IDLE.key)
      .setOrigin(0)
      .setDepth(5_000);
  }

  public async moveTo(pos: { col: number, row: number }, dir: "left" | "right" | "up" | "down"): Promise<void> {
    if (dir === "left") this.entity?.play("slime.move.left");
    else if (dir === "right") this.entity?.play("slime.move.right");
    
    return new Promise<void>((res) => {
      this.scene.tweens.add({
        targets: this.entity,
        x: 16 * pos.col,
        y: 16 * pos.row,
        duration : 200,
        ease: "Sine.easeInOut",
        onComplete: () => {
          if (dir === "left" || dir === "right") this.entity?.play("slime.idle");
          res();
        },
      });
    });
  }
}
