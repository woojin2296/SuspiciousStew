import * as Phaser from "phaser";

export class Player {
  static readonly TEXTURE_PATH = "/texture/Player.png";
  static readonly TEXTURE_KEY = "texture.Player";

  static readonly TILE_WIDTH = 16;
  static readonly TILE_HEIGHT = 32;

  static readonly ANIM_IDLE = {key : "player.anim.idle", start: 0, end: 1, frameRate: 3, repeat: -1};
  static readonly ANIM_ATTACK = {key : "player.anim.attack", start: 3, end: 6, frameRate: 12, repeat: 0};
  static readonly ANIM_DAMAGE = {key : "player.anim.damage", start: 8, end: 11, frameRate: 12, repeat: 0};
  
  static readonly TILE_SIZE = 16;

  static load(scene: Phaser.Scene) {
    scene.load.spritesheet(this.TEXTURE_KEY, this.TEXTURE_PATH, { frameWidth: this.TILE_WIDTH, frameHeight: this.TILE_HEIGHT });
  }
  static registerAnims(scene: Phaser.Scene) {
    const mk = (key: string, cfg: Phaser.Types.Animations.Animation) => !scene.anims.exists(key) && scene.anims.create({ key, ...cfg });
    mk(this.ANIM_IDLE.key, { frames: scene.anims.generateFrameNumbers(this.TEXTURE_KEY, { start: this.ANIM_IDLE.start, end: this.ANIM_IDLE.end }), frameRate: this.ANIM_IDLE.frameRate, repeat: this.ANIM_IDLE.repeat });
    mk(this.ANIM_ATTACK.key, { frames: scene.anims.generateFrameNumbers(this.TEXTURE_KEY, { start: this.ANIM_ATTACK.start, end: this.ANIM_ATTACK.end }), frameRate: this.ANIM_ATTACK.frameRate, repeat: this.ANIM_ATTACK.repeat });
    mk(this.ANIM_DAMAGE.key, { frames: scene.anims.generateFrameNumbers(this.TEXTURE_KEY, { start: this.ANIM_DAMAGE.start, end: this.ANIM_DAMAGE.end }), frameRate: this.ANIM_DAMAGE.frameRate, repeat: this.ANIM_DAMAGE.repeat });
  }

  private scene: Phaser.Scene;
  private entity: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, pos: { col: number, row: number }) {
    this.scene = scene;
    this.entity = scene.add
      .sprite(Player.TILE_SIZE * pos.col, Player.TILE_SIZE * pos.row, Player.TEXTURE_KEY)
      .play(Player.ANIM_IDLE.key)
      .setOrigin(0, 0.5)
      .setDepth(10_000);
  }

  public async moveTo(pos: { col: number, row: number }): Promise<void> {
    return new Promise<void>((res) => {
      this.scene.tweens.add({
        targets: this.entity,
        x: Player.TILE_SIZE * pos.col,
        y: Player.TILE_SIZE * pos.row,
        duration : 200,
        ease: "Sine.easeInOut",
        onComplete: () => {
          res();
        },
      });
    });
  }

  public attack() {
    this.entity.play(Player.ANIM_ATTACK.key)
      .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.entity.play(Player.ANIM_IDLE.key);
      });
  }
  
  public async damage(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.entity.play(Player.ANIM_DAMAGE.key)
        .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.entity.play(Player.ANIM_IDLE.key);
          resolve();
        });
    });
  }
}
