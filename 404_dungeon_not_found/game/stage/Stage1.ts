import * as Phaser from "phaser";
import { Player } from "../entity/Player";
import { Door } from "../entity/Door";
import { Box } from "../entity/Box";
import { GameScene } from "../scenes/GameScene";

export class Stage1 extends Phaser.Scene {
  private layers: { [name: string]: Phaser.Tilemaps.TilemapLayer | undefined } = {};
  private gameSetting = {} as any;
  private entitys = {} as any;
  private isMoving: boolean = false;

  constructor() {
    super("stage1");
  }

  preload() {
    this.load.tilemapTiledJSON("map.level1", "/map/level1.json");
  }

  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#0b0b53");

    const map = this.make.tilemap({ key: "map.level1" });
    const ts = map.addTilesetImage("TileSet", "texture.TileSet");
    if (!ts) return;

    const layerOrder: { name: string; depth: number }[] = [
      { name: "floor", depth: 0 },
      { name: "void", depth: 1 },
      { name: "pillardown", depth: 2 },
      { name: "pillarup", depth: 10_001 },
      { name: "wall", depth: 4 },
    ];

    for (const { name, depth } of layerOrder) {
      const layer = map.createLayer(name, ts, 0, 0);
      if (layer) {
        layer.setDepth(depth);
        this.layers[name] = layer;
      }
    }

    this.gameSetting = {
      SPAWN_POS: { col: 10, row: 8 },
      GOAL_POS: { col: 10, row: 2 },
      BOX_POS: { col: 9, row: 5 },
      HAS_KEY: true,
      PLAYER_HP: 3,
      MOVE_LIMIT: 12,
    }
    this.entitys = {
      player: { obj: new Player(this, { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row }), disabled: false, pos: { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row } },
      door: { obj: new Door(this, { col:this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row }, this.gameSetting.HAS_KEY), disabled: false, pos: { col: this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row } },
      box: { obj: new Box(this, { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row }), disabled: false, pos: { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row } },
    }
    this.isMoving = false;

    const eventBus = (this.scene.get("game") as GameScene).eventBus;
    const gameEventBus = (this.scene.get("game") as GameScene).gameEventBus;

    this.input.keyboard?.addCapture(["UP", "DOWN", "LEFT", "RIGHT"]);
    this.input.keyboard?.on("keydown-LEFT", () => gameEventBus.emit("gmae:input", "left"));
    this.input.keyboard?.on("keydown-RIGHT", () => gameEventBus.emit("gmae:input", "right"));
    this.input.keyboard?.on("keydown-UP", () => gameEventBus.emit("gmae:input", "up"));
    this.input.keyboard?.on("keydown-DOWN", () => gameEventBus.emit("gmae:input", "down"));

    gameEventBus.on("gmae:input", (key: "left" | "right" | "up" | "down") => {
      if (this.isMoving) return; this.isMoving = true;

      const { dc, dr } = { left: { dc: -1, dr: 0 }, right: { dc: 1, dr: 0 }, up: { dc: 0, dr: -1 }, down: { dc: 0, dr: 1 } }[key];
      const [nx, ny] = [this.entitys.player.pos.col + dc, this.entitys.player.pos.row + dr];

      const layerCheck = this.searchLayer(nx, ny);

      const isDoor = (col: number, row: number) => { return nx === this.entitys.door.pos.col && ny === this.entitys.door.pos.row && this.gameSetting.HAS_KEY; }
      const isBox = (col: number, row: number) => { return nx === this.entitys.box.pos.col && ny === this.entitys.box.pos.row && this.entitys.box.disabled === false; }
      const isWall = (col: number, row: number) => { return layerCheck.includes("wall") || layerCheck.includes("pillardown"); }
      const isPillarUp = (col: number, row: number) => { return layerCheck.includes("pillarup"); }

      const tags = [];

      if (isDoor(nx, ny)) {
        eventBus.emit("game:clear");
        this.isMoving = false;
        return;
      }

      if (isWall(nx, ny)) {
        this.isMoving = false;
        return;
      }

      if (isBox(nx, ny)) {
        tags.push("box");
      }

      if (isPillarUp(nx, ny)) {
        tags.push("pillarup");
      }

      gameEventBus.emit("game:proceed", nx, ny, tags);

      this.gameSetting.MOVE_LIMIT -= 1;
      if (this.gameSetting.MOVE_LIMIT <= 0) {
        eventBus.emit("game:over");
        return;
      }
    });

    gameEventBus.on("game:proceed", (nx: number, ny: number, tags: string[]) => {
      if (tags.includes("pillarup")) {
        const upLayer = this.layers["pillarup"];
        const downLayer = this.layers["pillardown"];
        const upTile = upLayer?.getTileAt(nx, ny);
        if (upTile) upTile.setAlpha(0.5);
        const downTile = downLayer?.getTileAt(nx, ny + 1);
        if (downTile) downTile.setAlpha(0.5);
      }
      else {
        const upLayer = this.layers["pillarup"];
        const downLayer = this.layers["pillardown"];
        upLayer?.forEachTile(tile => tile.setAlpha(1));
        downLayer?.forEachTile(tile => tile.setAlpha(1));
      }
    });

    gameEventBus.on("game:proceed", async (nx: number, ny: number, tags: string[]) => {
      if (tags.includes("box")) {
        this.entitys.box.disabled = true;
        this.entitys.box.obj?.destroy();
      }
      else{
        await this.entitys.player.obj?.moveTo({ col: nx, row: ny });
        this.entitys.player.pos = { col: nx, row: ny };   
      }
      
      this.isMoving = false;
    });
  }

  private searchLayer(col: number, row: number) {
    let result = [];
    for (const ln in this.layers) {
      const layer = this.layers[ln];
      if (!layer) continue;
      const tile = layer.getTileAt(col, row);
      if (tile && tile.index != 0) {
        result.push(ln);
      }
    }
    return result;
  }
}