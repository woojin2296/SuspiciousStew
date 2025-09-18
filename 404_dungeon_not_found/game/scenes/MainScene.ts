import * as Phaser from "phaser";
import { SceneFlow } from "@/game/core/SceneFlow";
import { AudioManager } from "../core/AudioManager";

export class MainScene extends Phaser.Scene {
  constructor() { super("main"); }

  async create() {
    AudioManager.getInstance(this.game).playBGM("audio.bgm.Main");

    const cam = this.cameras.main;
    cam.setRoundPixels(true);

    const { width: w, height: h } = this.scale;

    let gameTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.GameTitle")) {
      const img = this.add.image(w * 0.5, 50, "ui.GameTitle").setOrigin(0.5, 0);
      gameTitleObj = img;
    }

    let mainWindowObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.MainWindow")) {
      const img = this.add.image(0, 0, "ui.MainWindow").setOrigin(0);
      mainWindowObj = img;
    }

    let startButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.StartButton")) {
      const btn = this.add.image(w * 0.5,  h-86, "ui.StartButton").setOrigin(0.5, 1).setInteractive({ useHandCursor: true });
      btn.setAlpha(0);
      startButtonObj = btn;

      btn.on("pointerover", () => {
        this.tweens.add({
          targets: btn,
          y: btn.y - 1,
          duration: 50,
          ease: "Sine.easeOut"
        });
      });
      btn.on("pointerout", () => {
        this.tweens.add({
          targets: btn,
          y: btn.y + 1,
          duration: 50,
          ease: "Sine.easeOut"
        });
      });

      btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        AudioManager.getInstance(this.game).playSFX("audio.sfx.ui.StartButtonClick");
        SceneFlow.startWithFade(this, "game", { duration: 500 });
      });
    }

    let settingButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.SettingsButton")) {
      const btn = this.add.image(w * 0.5, h-50, "ui.SettingsButton").setOrigin(0.5, 1).setInteractive({ useHandCursor: true });
      btn.setAlpha(0);
      settingButtonObj = btn;

      btn.on("pointerover", () => {
        this.tweens.add({
          targets: btn,
          y: btn.y - 1,
          duration: 50,
          ease: "Sine.easeOut"
        });
      });
      btn.on("pointerout", () => {
        this.tweens.add({
          targets: btn,
          y: btn.y + 1,
          duration: 50,
          ease: "Sine.easeOut"
        });
      });

      btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.launch("settings");
      });
    }

    await new Promise((r) => setTimeout(r, 300));
    this.tweens.add({
      targets: [startButtonObj, settingButtonObj],
      alpha: 1,
      duration: 500,
      ease: "Sine.easeOut"
    });
  }
}
