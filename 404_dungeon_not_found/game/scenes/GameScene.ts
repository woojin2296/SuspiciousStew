import * as Phaser from "phaser";
import { Player } from "../entity/Player";
import { Box } from "../entity/Box";
import { Door } from "../entity/Door";
import { Slime } from "../entity/Slime";
import { Key } from "../entity/Key";
import { AudioManager } from "../core/AudioManager";
import { GameFlow } from "../core/GameFlow";

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

    if (!this.cache.audio.exists("walk")) this.load.audio("walk", "/audio/sfx/entity/player-move.mp3");
    if (!this.cache.audio.exists("destroy")) this.load.audio("destroy", "/audio/sfx/destroy.mp3");
    if (!this.cache.audio.exists("door")) this.load.audio("door", "/audio/sfx/door.mp3");
    if (!this.cache.audio.exists("fail")) this.load.audio("fail", "/audio/sfx/fail.mp3");
    if (!this.cache.audio.exists("bridge")) this.load.audio("bridge", "/audio/sfx/bridge.mp3");
    if (!this.cache.audio.exists("hit")) this.load.audio("hit", "/audio/sfx/hit.mp3");
  }

  create() {
    Player.registerAnims(this);
    Slime.registerAnims(this);
    
    const levels = ["stage1", "stage2", "stage3", "stage4", "stage6", "settings"];
    new GameFlow(this, this.eventBus, this.gameEventBus, levels).start();

    this.eventBus.on("game:over", () => {
      AudioManager.getInstance(this.game).playSFX("fail");
    });
    // optional sfx channel for bridge
    this.eventBus.on("sfx:bridge", () => {
      AudioManager.getInstance(this.game).playSFX("bridge");
    });
  }
}
