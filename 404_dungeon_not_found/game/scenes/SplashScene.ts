// /game/scenes/BootScene.ts
import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";
import { SceneFlow } from "@/game/core/SceneFlow";
import { Audio } from "@/game/core/Audio";

export class SplashScene extends Phaser.Scene {
  constructor() { super("splash"); }

  preload() {
    this.load.image("studio-logo", Config.splash.logoPath);
    this.load.image("studio-title", Config.splash.titleImagePath);
    // Audio manifest auto-preload
    Audio.I().preloadFromConfig(this);
    this.load.audio("main-bgm", Config.splash.bgmPath);
  }

  async create() {
    // Initialize Audio manager with the first active scene
    Audio.I().init(this);
    const cam = this.cameras.main;
    cam.setBackgroundColor(Config.splash.bgColor);
    cam.setRoundPixels(true);

    const cx = Config.resolution.width / 2;
    const cy = Config.resolution.height / 2;

    const group = this.add.container(cx, cy);

    let studioLogoObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("studio-logo")) {
      const img = this.add.image(0, 0, "studio-logo").setOrigin(0.5).setScrollFactor(0);
      const maxW = Math.min(
        Config.resolution.width * (Config.splash.logoMaxWidthRatio ?? 0.6),
        Config.splash.logoMaxWidthCap ?? 256
      );
      if (img.width > 0 && img.width > maxW) {
        const ratio = img.height / img.width;
        img.setDisplaySize(maxW, Math.round(maxW * ratio));
      }
      studioLogoObj = img;
      group.add(studioLogoObj);
      studioLogoObj.setAlpha(0).setScale(1);
    }

    let studioTitleObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("studio-title")) {
      const studio_title = this.add.image(0, 0, "studio-title").setOrigin(0.5);
      const tMaxW = Math.min(
        Config.resolution.width * (Config.splash.titleMaxWidthRatio ?? 0.6),
        Config.splash.titleMaxWidthCap ?? 256
      );
      if (studio_title.width > 0 && studio_title.width > tMaxW) {
        const ratio = studio_title.height / studio_title.width;
        studio_title.setDisplaySize(tMaxW, Math.round(tMaxW * ratio));
      }
      studio_title.setAlpha(0);
      group.add(studio_title);
      studioTitleObj = studio_title;
    }

    await new Promise((r) => setTimeout(r, Config.splash.showDelayStartMs));

    const spacing = Config.splash.spacing ?? 12;
    const lw = studioLogoObj ? studioLogoObj.displayWidth : 0;
    const tw = studioTitleObj ? studioTitleObj.displayWidth : 0;
    const totalW = lw + (lw > 0 && tw > 0 ? spacing : 0) + tw;
    const logoFinalX = lw > 0 ? -totalW / 2 + lw / 2 : 0;
    const textFinalX = tw > 0 ? totalW / 2 - tw / 2 : 0;

    if (studioLogoObj) studioLogoObj.x = 0;
    if (studioTitleObj) studioTitleObj.x = textFinalX;

    if (studioLogoObj) {
      this.tweens.add({
        targets: studioLogoObj,
        alpha: 1,
        duration: Config.splash.alphaDurationMs,
        ease: Config.splash.easeAlpha,
        onComplete: () => {
          this.tweens.add({
            targets: studioLogoObj,
            x: logoFinalX,
            duration: Config.splash.logoSlideMs ?? 320,
            ease: Config.splash.easeMove,
            onComplete: () => {
              if (studioTitleObj) {
                this.tweens.add({
                  targets: studioTitleObj,
                  alpha: 1,
                  duration: Config.splash.titleFadeMs ?? 320,
                  ease: Config.splash.easeAlpha,
                });
              }
            }
          });
        },
      });
    } else {
      if (studioTitleObj) {
        studioTitleObj.x = 0;
        this.tweens.add({ targets: studioTitleObj, alpha: 1, duration: Config.splash.alphaDurationMs, ease: Config.splash.easeAlpha });
      }
    }

    const onResize = () => {
      const { width, height } = this.scale;
      group.setPosition(width / 2, height / 2);
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, onResize);
    });

    await new Promise((r) => setTimeout(r, Config.splash.showDelayEndMs));
    await SceneFlow.startWithFade(this, "main", { duration: Config.splash.fadeOutMs });
  }

  shutdown() {
    this.textures.remove("studio-logo");
    this.textures.remove("studio-title");
  }
}
