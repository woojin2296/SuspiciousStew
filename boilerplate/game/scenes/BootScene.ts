// /game/scenes/BootScene.ts
import Phaser from "phaser";
import { Config } from "@/game/core/Config";
import { SceneFlow } from "@/game/core/SceneFlow";

export class BootScene extends Phaser.Scene {
  private percentText!: Phaser.GameObjects.Text;
  private preloadStartTime!: number;

  constructor() { super("boot"); }

  preload() {
    if (Config.pixelArt) {
      this.game.renderer?.canvas?.setAttribute(
        "style",
        "image-rendering: pixelated;"
      );
    }

    // 로딩 시작 시간 기록
    this.preloadStartTime = performance.now();

    const cx = Config.resolution.width / 2;
    const cy = Config.resolution.height / 2;
    this.percentText = this.add
      .text(cx, cy, "Loading 0%", {
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#000000",
      })
      .setOrigin(0.5);

    this.load.audio("bgm", [
      "/assets/audio/main_bgm.ogg",
      "/assets/audio/main_bgm.mp3",
    ]);

    // this.load.tilemapTiledJSON("map.level1", "/assets/maps/level1.json");
    // this.load.image("tileset", "/assets/maps/tileset.png");

    // 퍼센트 표시
    this.load.on("progress", (p: number) => {
      this.percentText.setText(`Loading ${Math.round(p * 100)}%`);
    });
  }

  async create() {
    // // 얼마나 걸렸는지 계산
    // const elapsed = performance.now() - this.preloadStartTime;
    // const remain = Math.max(0, 1000 - elapsed); // 1000ms = 1초

    // // 1초 미만이면 그만큼 대기
    // if (remain > 0) {
    //   await new Promise((r) => setTimeout(r, remain));
    // }

    this.percentText?.destroy();

    // 씬 전환
    await SceneFlow.startWithFade(this, "main", { duration: 500 });
  }
}