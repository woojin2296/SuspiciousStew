import * as Phaser from "phaser";
import { Player } from "../entity/Player";
import { Door } from "../entity/Door";
import { Box } from "../entity/Box";
import { GameScene } from "../scenes/GameScene";
import { Key } from "../entity/Key";
import { Slime } from "../entity/Slime";

export class Stage3 extends Phaser.Scene {
  private layers: { [name: string]: Phaser.Tilemaps.TilemapLayer | undefined } = {};
  private gameSetting = {} as any;
  private entitys = {} as any;
  private isMoving: boolean = false;

  constructor() {
    super("stage3");
  }

  preload() {
    this.load.tilemapTiledJSON("map.level3", "/map/level3.json");
  }

  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#0b0b53");

    const map = this.make.tilemap({ key: "map.level3" });
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
      SPAWN_POS: { col: 9, row: 8 },
      GOAL_POS: { col: 10, row: 1 },
      SLIME1_POS: { col: 7, row: 6 },
      SLIME2_POS: { col: 10, row: 3 },
      BOX_POS: { col: 10, row: 8 },
      KEY_POS: { col: 10, row: 4 },
      HAS_KEY: false,
      PLAYER_HP: 3,
      MOVE_LIMIT: 9,
    }
    this.entitys = {
      player: { obj: new Player(this, { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row }), disabled: false, pos: { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row } },
      door: { obj: new Door(this, { col:this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row }, this.gameSetting.HAS_KEY), disabled: false, pos: { col: this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row } },
      slime1: { obj: new Slime(this, { col: this.gameSetting.SLIME1_POS.col, row: this.gameSetting.SLIME1_POS.row }), disabled: false, dir: "right", pos: { col: this.gameSetting.SLIME1_POS.col, row: this.gameSetting.SLIME1_POS.row } },
      slime2: { obj: new Slime(this, { col: this.gameSetting.SLIME2_POS.col, row: this.gameSetting.SLIME2_POS.row }), disabled: false, dir: "left", pos: { col: this.gameSetting.SLIME2_POS.col, row: this.gameSetting.SLIME2_POS.row } },
      box: { obj: new Box(this, { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row }), disabled: false, pos: { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row } },
      key: { obj: new Key(this, { col: this.gameSetting.KEY_POS.col, row: this.gameSetting.KEY_POS.row }), disabled: false, pos: { col: this.gameSetting.KEY_POS.col, row: this.gameSetting.KEY_POS.row } },
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

      const [dsc1, dsr1] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[this.entitys.slime1.dir as "left" | "right" | "up" | "down"];
      const [nsx1, nsy1] = [this.entitys.slime1.pos.col + dsc1, this.entitys.slime1.pos.row + dsr1];

      const [dsc2, dsr2] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[this.entitys.slime2.dir as "left" | "right" | "up" | "down"];
      const [nsx2, nsy2] = [this.entitys.slime2.pos.col + dsc2, this.entitys.slime2.pos.row + dsr2];


      const isDoor = (col: number, row: number) => { return col === this.entitys.door.pos.col && row === this.entitys.door.pos.row && this.gameSetting.HAS_KEY; }
      const isKey = (col: number, row: number) => { return col === this.entitys.key.pos.col && row === this.entitys.key.pos.row&& !this.entitys.key.disabled; }
      const isWall = (col: number, row: number) => { return this.searchLayer(col, row).includes("wall") || this.searchLayer(col, row).includes("pillardown"); }
      const isBox = (col: number, row: number) => { return col === this.entitys.box.pos.col && row === this.entitys.box.pos.row && this.entitys.box.disabled === false; }
      const isPillarUp = (col: number, row: number) => { return this.searchLayer(col, row).includes("pillarup"); }
      const isSlime = (col: number, row: number) => { return (col === nsx1 && row === nsy1 && !this.entitys.slime1.disabled) || (col === nsx2 && row === nsy2 && !this.entitys.slime2.disabled); }

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

      if (isKey(nx, ny) && !isSlime(nx, ny)) {
        tags.push("key");
      }

      if (isBox(nx, ny)) {
        tags.push("box");
      }

      if (isSlime(nx, ny)) {
        tags.push("slime");
      }

      gameEventBus.emit("game:proceed", nx, ny, tags);

      if (!this.entitys.slime1.disabled) {
        const slime = this.entitys.slime1;
        let { nsx, nsy } = { left: { nsx: slime.pos.col - 1, nsy: slime.pos.row }, right: { nsx: slime.pos.col + 1, nsy: slime.pos.row }, up: { nsx: slime.pos.col, nsy: slime.pos.row - 1 }, down: { nsx: slime.pos.col, nsy: slime.pos.row + 1 } }[slime.dir as "left" | "right" | "up" | "down"];
        console.log(nsx, nsy, isWall(nsx, nsy));
        if (isWall(nsx, nsy)) {
          slime.dir = slime.dir === "left" ? "right" : slime.dir === "right" ? "left" : slime.dir === "up" ? "down" : "up";
          nsx = slime.pos.col + (slime.dir === "left" ? -1 : slime.dir === "right" ? 1 : 0);
          nsy = slime.pos.row + (slime.dir === "up" ? -1 : slime.dir === "down" ? 1 : 0);
        }
        slime.obj?.moveTo({ col: nsx, row: nsy }, slime.dir as "left" | "right" | "up" | "down");
        slime.pos = { col: nsx, row: nsy };
      }

      if (!this.entitys.slime2.disabled) {
        const slime = this.entitys.slime2;
        let { nsx, nsy } = { left: { nsx: slime.pos.col - 1, nsy: slime.pos.row }, right: { nsx: slime.pos.col + 1, nsy: slime.pos.row }, up: { nsx: slime.pos.col, nsy: slime.pos.row - 1 }, down: { nsx: slime.pos.col, nsy: slime.pos.row + 1 } }[slime.dir as "left" | "right" | "up" | "down"];
        console.log(nsx, nsy, isWall(nsx, nsy));
        if (isWall(nsx, nsy)) {
          slime.dir = slime.dir === "left" ? "right" : slime.dir === "right" ? "left" : slime.dir === "up" ? "down" : "up";
          nsx = slime.pos.col + (slime.dir === "left" ? -1 : slime.dir === "right" ? 1 : 0);
          nsy = slime.pos.row + (slime.dir === "up" ? -1 : slime.dir === "down" ? 1 : 0);
        }
        slime.obj?.moveTo({ col: nsx, row: nsy }, slime.dir as "left" | "right" | "up" | "down");
        slime.pos = { col: nsx, row: nsy };
      }

      

      if (isPillarUp(nx, ny)) {
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

      this.gameSetting.MOVE_LIMIT -= 1;
      if (this.gameSetting.MOVE_LIMIT <= 0) {
        eventBus.emit("game:over");
        return;
      }
    });

    gameEventBus.on("game:proceed", async (nx: number, ny: number, tags: string[]) => {
      if (tags.includes("key")) {
        this.entitys.key.disabled = true;
        this.entitys.key.obj?.taken();
        gameEventBus.emit("game:key:taken");
      }

      if (tags.includes("slime")) {
        await this.entitys.player.obj?.moveTo({ col: nx, row: ny });
        await this.entitys.player.obj?.damage();
        await this.entitys.player.obj?.moveTo({ col: this.entitys.player.pos.col, row: this.entitys.player.pos.row });
      }
      else if (tags.includes("box")) {
        this.entitys.box.disabled = true;
        this.entitys.box.obj?.destroy();
      }
      else{
        await this.entitys.player.obj?.moveTo({ col: nx, row: ny });
        this.entitys.player.pos = { col: nx, row: ny };   
      }

      this.isMoving = false;
    });

    gameEventBus.on("game:key:taken", () => {
      this.gameSetting.HAS_KEY = true;
      this.entitys.door.obj?.open();
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