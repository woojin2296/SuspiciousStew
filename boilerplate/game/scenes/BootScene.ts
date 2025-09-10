import Phaser from "phaser";
import { Config } from "@/game/core/Config";

export class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() { super("boot"); }

  preload() {
    // 픽셀 보존(브라우저 필터링 방지)
    if (Config.pixelArt) {
      this.game.renderer?.canvas?.setAttribute("style", "image-rendering: pixelated;");
    }

    // 간단한 로딩 표시
    this.loadingText = this.add.text(
      Config.resolution.width / 2,
      Config.resolution.height / 2,
      "Loading…",
      { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" }
    ).setOrigin(0.5);

    // (여기에 실제 에셋 로딩이 들어가도 됨)
    // this.load.image("logo", "/assets/logo.png");
    // this.load.on("progress", p => this.loadingText.setText(`Loading… ${Math.round(p*100)}%`));

    this.time.delayedCall(2000, () => {   // 2000ms = 2초 후
        this.scene.start("main");
      });
  }

//   create() {
//     this.scene.start("main"); // 메인으로 전환
//   }
}