import * as Phaser from "phaser";
export class SettingScene extends Phaser.Scene {
  constructor() {
    super("settings");
  }

  preload() {
    if (this.textures.exists("ui.Credit") === false) {
      this.load.image("ui.Credit", "/ui/Credit.png");
    }
  }

  create() {
    let gameMaskObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.Credit")) {
      const img = this.add.image(0, 0, "ui.Credit").setOrigin(0, 0).setInteractive({ useHandCursor: true });
      gameMaskObj = img;

      img.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.stop();
      });
    }
  }
}
