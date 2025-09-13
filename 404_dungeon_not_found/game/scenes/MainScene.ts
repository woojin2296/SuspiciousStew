import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";
import { SceneFlow } from "@/game/core/SceneFlow";
import { AudioManager } from "../core/AudioManager";

export class MainScene extends Phaser.Scene {
  constructor() { super("main"); }

  async create() {
    AudioManager.getInstance(this.game).playBGM("audio.bgm.Main");

    const cam = this.cameras.main;
    cam.setBackgroundColor("#FFFFFF");
    cam.setRoundPixels(true);

    const { width: w, height: h } = this.scale;

    let gameTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.GameTitle")) {
      const img = this.add.image(w * 0.5, h * 0.4, "ui.GameTitle").setOrigin(0.5);
      const maxW = Math.min(
        Config.resolution.width * (Config.main.titleMaxWidthRatio ?? 0.6),
        Config.main.titleMaxWidthCap ?? 256
      );
      if (img.width > 0 && img.width > maxW) {
        const ratio = img.height / img.width;
        img.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      gameTitleObj = img;
    }

    const menuGroup = this.add.container(w * 0.5, h * 0.5);

    let startButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.StartButton")) {
      const btn = this.add.image(0, h * 0.2, "ui.StartButton").setOrigin(0.5).setInteractive({ useHandCursor: true });
      const maxW = Math.min(
        Config.resolution.width * (Config.main.buttonMaxWidthRatio ?? 0.4),
        Config.main.buttonMaxWidthCap ?? 280
      );
      if (btn.width > 0 && btn.width > maxW) {
        const ratio = btn.height / btn.width;
        btn.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      menuGroup.add(btn);
      startButtonObj = btn;

      const hoverTint = Config.main.hoverTint ?? 0xffffaa;

      btn.on("pointerover", () => {
        this.tweens.add({
          targets: btn,
          tint: hoverTint,
          duration: 150,
          ease: "Sine.easeOut"
        });
      });
      btn.on("pointerout", () => {
        this.tweens.add({
          targets: btn,
          tint: 0xffffff,
          duration: 150,
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
      const btn = this.add.image(0, h * 0.35, "ui.SettingsButton").setOrigin(0.5).setInteractive({ useHandCursor: true });
      const maxW = Math.min(
        Config.resolution.width * (Config.main.buttonMaxWidthRatio ?? 0.4),
        Config.main.buttonMaxWidthCap ?? 280
      );
      if (btn.width > 0 && btn.width > maxW) {
        const ratio = btn.height / btn.width;
        btn.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      menuGroup.add(btn);
      settingButtonObj = btn;

      const hoverTint = Config.main.hoverTint ?? 0xffffaa;

      btn.on("pointerover", () => {
        this.tweens.add({
          targets: btn,
          tint: hoverTint,
          duration: 150,
          ease: "Sine.easeOut"
        });
      });
      btn.on("pointerout", () => {
        this.tweens.add({
          targets: btn,
          tint: 0xffffff,
          duration: 150,
          ease: "Sine.easeOut"
        });
      });

      btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.launch("settings");
      });
    }

    menuGroup.setAlpha(0);
    await new Promise((r) => setTimeout(r, 300));
    this.tweens.add({
      targets: menuGroup,
      alpha: 1,
      duration: 500,
      ease: "Sine.easeOut"
    });
  }
}
