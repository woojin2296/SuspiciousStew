// /game/scenes/BootScene.ts
import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";
import { SceneFlow } from "@/game/core/SceneFlow";
import { AudioManager } from "../core/AudioManager";

export class SplashScene extends Phaser.Scene {
  constructor() { super("splash"); }

  preload() {
    this.load.image("ui.StudioLogo", "/ui/StudioLogo.png");
    this.load.image("ui.StudioTitle", "/ui/StudioTitle.png");
    this.load.image("ui.GameTitle", "/ui/GameTitle.jpg");
    this.load.image("ui.StartButton", "/ui/StartButton.png");
    this.load.image("ui.SettingsButton", "/ui/SettingButton.png");

    this.load.audio("audio.bgm.Main", "/audio/bgm/Main.ogg");
    this.load.audio("audio.sfx.ui.StartButtonClick", "/audio/sfx/ui/StartButtonClick.mp3");
    this.load.audio("audio.sfx.ui.UiButtonClick", "/audio/sfx/ui/UiButtonClick.mp3");

    this.load.image("tiles.grass", "/map/Grass.png");
    this.load.tilemapTiledJSON("map.testlevel", "/map/testlevel.json");
  }

  async create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor(Config.splash.bgColor);
    cam.setRoundPixels(true);

    const { width: w, height: h } = this.scale;

    const studioGroup = this.add.container(w * 0.5, h * 0.5);

    let studioLogoObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.StudioLogo")) {
      const img = this.add.image(0, -3, "ui.StudioLogo").setOrigin(0.5).setScrollFactor(0);
      const maxW = Math.min(
        Config.resolution.width * (Config.splash.logoMaxWidthRatio ?? 0.6),
        Config.splash.logoMaxWidthCap ?? 256
      );
      if (img.width > 0 && img.width > maxW) {
        const ratio = img.height / img.width;
        img.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      studioLogoObj = img;
      studioGroup.add(studioLogoObj);
      studioLogoObj.setAlpha(0).setScale(1);
    }

    let studioTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.StudioTitle")) {
      const img = this.add.image(0, 0, "ui.StudioTitle").setOrigin(0.5);
      const maxW = Math.min(
        Config.resolution.width * (Config.splash.titleMaxWidthRatio ?? 0.6),
        Config.splash.titleMaxWidthCap ?? 256
      );
      if (img.width > 0 && img.width > maxW) {
        const ratio = img.height / img.width;
        img.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      img.setAlpha(0);
      studioGroup.add(img);
      studioTitleObj = img;
    }

    const gameTitleGroup = this.add.container(w * 0.5, h * 0.5);

    let gameTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.GameTitle")) {
      const img = this.add.image(0, -h * 0.1, "ui.GameTitle").setOrigin(0.5);
      const maxW = Math.min(
        Config.resolution.width * (Config.main.titleMaxWidthRatio ?? 0.6),
        Config.main.titleMaxWidthCap ?? 256
      );
      if (img.width > 0 && img.width > maxW) {
        const ratio = img.height / img.width;
        img.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      gameTitleGroup.add(img);
      gameTitleObj = img;
    }

    let gameStartText: Phaser.GameObjects.Text | undefined;
    if (true) {
      const text = this.add.text(0, h * 0.4, "Click to Start", { fontFamily: "monospace", fontSize: "16px", color: "#888888" }).setOrigin(0.5);
      gameTitleGroup.add(text);
      gameStartText = text;
    }
    gameTitleGroup.setAlpha(0);

    const spacing = Config.splash.spacing ?? 12;
    const lw = studioLogoObj ? studioLogoObj.displayWidth : 0;
    const tw = studioTitleObj ? studioTitleObj.displayWidth : 0;
    const totalW = lw + (lw > 0 && tw > 0 ? spacing : 0) + tw;
    const logoFinalX = lw > 0 ? -totalW / 2 + lw / 2 : 0;
    const textFinalX = tw > 0 ? totalW / 2 - tw / 2 : 0;
    if (studioLogoObj) studioLogoObj.x = 0;
    if (studioTitleObj) studioTitleObj.x = textFinalX;

    await new Promise((r) => setTimeout(r, Config.splash.showDelayStartMs));

    if (studioLogoObj && studioTitleObj) {
      await ((targets: Phaser.GameObjects.Image) => {
        return new Promise<void>((resolve) => {
          this.tweens.add({
            targets: targets,
            alpha: 1,
            duration: Config.splash.titleFadeMs ?? 320,
            ease: Config.splash.easeAlpha,
            onComplete: () => resolve(),
          });
        });
      })(studioLogoObj);

      await ((targets: Phaser.GameObjects.Image) => {
        return new Promise<void>((resolve) => {
          this.tweens.add({
            targets: targets,
            x: logoFinalX,
            duration: Config.splash.logoSlideMs ?? 320,
            ease: Config.splash.easeMove,
            onComplete: () => resolve(),
          });
        });
      })(studioLogoObj);

      await ((targets: Phaser.GameObjects.Image) => {
        return new Promise<void>((resolve) => {
          if (studioTitleObj) {
            this.tweens.add({
              targets: targets,
              alpha: 1,
              duration: Config.splash.titleFadeMs ?? 320,
              ease: Config.splash.easeAlpha,
              onComplete: () => resolve(),
            });
          } else {
            resolve();
          }
        });
      })(studioTitleObj);
    }

    await new Promise((r) => setTimeout(r, 1000));

    await SceneFlow.fadeOut(this, { duration: 500 });
    studioGroup.destroy();
    gameTitleGroup.setAlpha(1);
    await SceneFlow.fadeIn(this, { duration: 500 });

    const blink = this.tweens.add({
      targets: gameStartText,
      alpha: 0,
      duration: 500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.input.once("pointerdown", () => {
      AudioManager.getInstance(this.game).playSFX("audio.sfx.ui.StartButtonClick");
      this.input.enabled = false;
      blink.stop();
      gameStartText?.setAlpha(1);
      this.tweens.add({
        targets: gameStartText,
        alpha: 0,
        duration: 100,
        yoyo: true,
        repeat:2,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.scene.start("main");
        }
      })
    });
  }

  shutdown() {
    this.textures.remove("studio-logo");
    this.textures.remove("studio-title");
  }
}
