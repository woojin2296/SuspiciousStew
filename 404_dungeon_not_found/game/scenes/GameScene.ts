import * as Phaser from "phaser";
import { Player } from "../entity/Player";
import { Box } from "../entity/Box";
import { Door } from "../entity/Door";
import { Slime } from "../entity/Slime";
import { Key } from "../entity/Key";

export class GameScene extends Phaser.Scene {

  public eventBus = new Phaser.Events.EventEmitter();
  public gameEventBus = new Phaser.Events.EventEmitter();

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("texture.TileSet", "/texture/TileSet.png");

    Box.load(this);
    Door.load(this);
    Key.load(this);
    Player.load(this);
    Slime.load(this);
  }

  create() {
    Player.registerAnims(this);
    Slime.registerAnims(this);
    
    let currentLevel = 0;
    const levels = ["stage4", "stage1", "stage2", "stage3", "stage4", "stage5", "stage6"];
    
    this.scene.launch(levels[currentLevel]);
    this.scene.launch("stage-ui");

    this.eventBus.on("game:clear", () => {
      console.log("game clear");
      this.gameEventBus.removeAllListeners();
      this.scene.stop(levels[currentLevel]);
      currentLevel += 1
      this.scene.launch(levels[currentLevel]);

    });

    this.eventBus.on("game:over", () => {
      console.log("game over");
      this.gameEventBus.removeAllListeners();
      this.scene.stop(levels[currentLevel]);
      this.scene.launch(levels[currentLevel]);
    });
  }
}