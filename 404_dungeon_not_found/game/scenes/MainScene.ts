import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";

export class MainScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;
  constructor() { super("main"); }

  preload() {
    this.load.image("ui-title", Config.main.titleImagePath);
    this.load.image("ui-btn-start", Config.main.startButtonPath);
    this.load.image("ui-btn-settings", Config.main.settingsButtonPath);
  }

  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#000000");
    cam.setRoundPixels(true);

    const { width: w, height: h } = this.scale;

    let gameTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui-title")) {
      const img = this.add.image(w * 0.5, h * 0.3, "ui-title").setOrigin(0.5).setScrollFactor(0);
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

    let startButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui-btn-start")) {
      const btn = this.add.image(w * 0.5, h * 0.65, "ui-btn-start").setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setAlpha(0);
      const maxW = Math.min(
        Config.resolution.width * (Config.main.buttonMaxWidthRatio ?? 0.4),
        Config.main.buttonMaxWidthCap ?? 280
      );
      if (btn.width > 0 && btn.width > maxW) {
        const ratio = btn.height / btn.width;
        btn.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
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
    }

    let settingButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui-btn-settings")) {
      const btn = this.add.image(w * 0.5, h * 0.85, "ui-btn-settings").setAlpha(0).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
      const maxW = Math.min(
        Config.resolution.width * (Config.main.buttonMaxWidthRatio ?? 0.4),
        Config.main.buttonMaxWidthCap ?? 280
      );
      if (btn.width > 0 && btn.width > maxW) {
        const ratio = btn.height / btn.width;
        btn.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
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
    }

    const gameStartText = this.add.text(w * 0.5, h * 0.85, "Click to Start", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#FFFFFF",
    }).setOrigin(0.5);

    this.tweens.add({
      targets: gameStartText,
      alpha: 0,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    if (this.cache.audio.exists("main-bgm")) {
      this.bgm = this.sound.add("main-bgm", { loop: true, volume: 0.6 });
    }

    const start = () => {
      if (this.sound.locked) this.sound.context.resume().catch(() => { });

      const main = this.scene.get("main") as Phaser.Scene;
      main?.events.emit("ui:start");

      this.tweens.add({
        targets: gameStartText, 
        alpha: 0,
        duration: 200,
        onComplete: () => gameStartText.destroy(),
      });

      this.tweens.add({
        targets: [startButtonObj, settingButtonObj],
        alpha: 1,
        duration: 200,
      });

      if (this.bgm && !this.bgm.isPlaying) {
        this.bgm.play();
      }

      this.input.off("pointerdown", start);
      this.input.keyboard?.off("keydown", start as any);
      window.removeEventListener("click", onDom);
      window.removeEventListener("touchstart", onDom);
      window.removeEventListener("keydown", onDom);
    };

    const onDom = () => start();
    this.input.once("pointerdown", start);
    this.input.keyboard?.once("keydown", start);
    window.addEventListener("click", onDom, { passive: true });
    window.addEventListener("touchstart", onDom, { passive: true });
    window.addEventListener("keydown", onDom, { passive: true });
  }

  shutdown() {

  }
}
