import * as Phaser from "phaser";
import { GameFlow } from "@/game/core/GameFlow";

export class GameScene extends Phaser.Scene {
  constructor() { super("game"); }

  preload() {
    // Scene handles loading only; GameFlow consumes these assets
    if (!this.textures.exists("tiles.grass")) this.load.image("tiles.grass", "/map/Grass.png");
    if (!(this.cache.tilemap as any).has("map.testlevel")) this.load.tilemapTiledJSON("map.testlevel", "/map/testlevel.json");
  }

  create() {
    GameFlow.start(this);
  }
}

