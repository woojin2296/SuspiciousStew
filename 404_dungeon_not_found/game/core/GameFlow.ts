import * as Phaser from "phaser";

export class GameFlow {
  private host: Phaser.Scene;
  private eventBus: Phaser.Events.EventEmitter;
  private gameEventBus: Phaser.Events.EventEmitter;
  private levels: string[];
  private current = 0;

  constructor(
    host: Phaser.Scene,
    eventBus: Phaser.Events.EventEmitter,
    gameEventBus: Phaser.Events.EventEmitter,
    levels: string[],
  ) {
    this.host = host;
    this.eventBus = eventBus;
    this.gameEventBus = gameEventBus;
    this.levels = levels;
  }

  start() {
    if (this.levels.length === 0) return;
    this.host.scene.launch(this.levels[this.current]);
    this.host.scene.launch("stage-ui");
    this.host.scene.bringToTop("stage-ui");

    this.eventBus.on("game:clear", this.onClear);
    this.eventBus.on("game:over", this.onOver);
    this.eventBus.on("game:restart", this.onRestart);
  }

  private onClear = () => {
    this.gameEventBus.removeAllListeners();
    this.host.scene.stop(this.levels[this.current]);
    this.current = Math.min(this.current + 1, this.levels.length - 1);
    this.host.scene.launch(this.levels[this.current]);
    this.host.scene.bringToTop("stage-ui");
  };

  private onOver = () => {
    this.host.scene.pause(this.levels[this.current]);
  };

  private onRestart = () => {
    this.gameEventBus.removeAllListeners();
    this.host.scene.stop(this.levels[this.current]);
    this.host.scene.launch(this.levels[this.current]);
    this.host.scene.bringToTop("stage-ui");
  };
}
