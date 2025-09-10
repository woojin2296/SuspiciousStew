import Phaser from "phaser";
import { Config } from "@/game/core/Config";

export class MainScene extends Phaser.Scene {
  constructor() { super("main"); }

  create() {
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.add.text(
      Config.resolution.width / 2,
      Config.resolution.height / 2,
      "Main Scene",
      { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" }
    ).setOrigin(0.5);

    // 픽셀 감성 유지용 정수 배 줌(원하면 2~4로 조정)
    this.cameras.main.setZoom(3);
  }
}