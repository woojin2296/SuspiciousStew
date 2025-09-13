import * as Phaser from "phaser";
import { attachInput, Input } from "@/game/core/Input";

export class GameScene extends Phaser.Scene {
  private inputMgr?: Input;
  private map?: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("game");
  }

  create() {
    // Build tilemap if available
    this.map = this.make.tilemap({ key: "map.testlevel" });
    if (this.map) {
      const ts = this.map.addTilesetImage("grass", "tiles.grass");
      if (ts) {
        // Create all known layers if present
        const layerNames = ["void", "floor", "wall", "goal"];
        layerNames.forEach((ln) => {
          if ((this.map as Phaser.Tilemaps.Tilemap).getLayerIndex(ln) !== -1) {
            this.map!.createLayer(ln, ts, 0, 0);
          }
        });

        // Camera fit to map
        const cam = this.cameras.main;
        cam.setBackgroundColor("#000");
        cam.setRoundPixels(true);
        cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        const vw = this.scale.width;
        const vh = this.scale.height;
        const zoom = Math.min(vw / this.map.widthInPixels, vh / this.map.heightInPixels);
        cam.setZoom(zoom);
        cam.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
      }
    } else {
      // Fallback text if map missing
      const { width: W, height: H } = this.scale;
      this.add
        .text(W / 2, H / 2, "Map not found: /map/testlevel.json", { fontFamily: "monospace", fontSize: "14px", color: "#ff8080" })
        .setOrigin(0.5);
    }

    // Attach input and wire ESC → settings, R → restart
    this.inputMgr = attachInput(this);
    this.inputMgr.on("esc", () => this.openSettings());
    this.inputMgr.on("restart", () => this.scene.restart());
  }

  private openSettings() {
    // Pause game updates and open settings overlay
    this.scene.launch("settings");
    this.scene.pause();
  }
}
