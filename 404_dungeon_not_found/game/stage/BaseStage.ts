import * as Phaser from "phaser";
import { Player } from "../entity/Player";
import { Door } from "../entity/Door";
import { Box } from "../entity/Box";
import { Key } from "../entity/Key";
import { Slime } from "../entity/Slime";
import { GameScene } from "../scenes/GameScene";

export type Dir = "left" | "right" | "up" | "down";

export type StagePositions = {
  SPAWN_POS: { col: number; row: number };
  GOAL_POS: { col: number; row: number };
  SLIME1_POS: { col: number; row: number };
  SLIME2_POS: { col: number; row: number };
  BOX_POS: { col: number; row: number };
  KEY_POS: { col: number; row: number };
  HAS_KEY: boolean;
  PLAYER_HP: number;
  MOVE_LIMIT: number;
};

export abstract class BaseStage extends Phaser.Scene {
  protected layers: { [name: string]: Phaser.Tilemaps.TilemapLayer | undefined } = {};
  protected gameSetting: StagePositions = {} as any;
  protected entitys: any = {} as any;
  protected isMoving = false;
  protected patches: number[] = [];
  protected patchLocked = false;
  protected repeatFlag = false;
  protected forcedDir: Dir | null = null; // patch(5): force next inputs
  protected pendingSlimeHitDir: Dir | null = null; // direction of slime that collided
  protected pendingSlimeId: "slime1" | "slime2" | null = null; // which slime collided
  // no skeleton/box2/attack features

  // Stage-specific requirements
  protected abstract getMapKey(): string; // e.g. "map.level3"
  protected abstract getPositions(): StagePositions;
  protected abstract getInitialSlimeDirs(): { slime1: Dir; slime2: Dir };

  // Optional stage customizations
  protected getAvailablePatches(): number[] { return []; }
  protected getMaxSelectablePatches(): number { return 1; }
  protected getPresence(): { key: boolean; box: boolean; slime1: boolean; slime2: boolean } {
    return { key: true, box: true, slime1: true, slime2: true };
  }

  // Hook: pre-compute slime next tiles for collision tags
  // Return values should be [nsx1,nsy1, nsx2,nsy2]
  // Default: try forward 1; if wall, predict bounce (reverse) and use that tile
  protected precomputeSlimeNextTargets(
    isWall: (c: number, r: number) => boolean,
  ): [number, number, number, number] {
    const s1 = this.entitys.slime1;
    const s2 = this.entitys.slime2;
    const step = (dir: Dir) => ({
      dc: dir === "left" ? -1 : dir === "right" ? 1 : 0,
      dr: dir === "up" ? -1 : dir === "down" ? 1 : 0,
    });
    const predict = (s: any): [number, number] => {
      if (!s || s.disabled) return [-9999, -9999];
      let dir = s.dir as Dir;
      let { dc, dr } = step(dir);
      let nx = s.pos.col + dc;
      let ny = s.pos.row + dr;
      if (isWall(nx, ny)) {
        dir = dir === "left" ? "right" : dir === "right" ? "left" : dir === "up" ? "down" : "up";
        ({ dc, dr } = step(dir));
        nx = s.pos.col + dc;
        ny = s.pos.row + dr;
      }
      return [nx, ny];
    };
    const ns1 = predict(s1);
    const ns2 = predict(s2);
    return [ns1[0], ns1[1], ns2[0], ns2[1]];
  }

  // Hook: after computing targets and before applying tags
  // Allows stages to show markers, etc.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPreTags(
    nx: number,
    ny: number,
    nsx1: number,
    nsy1: number,
    nsx2: number,
    nsy2: number,
  ): void { /* default noop */ }

  // Hook: perform per-slime movement after player proceeds
  // Default: bounce when hit wall, otherwise move 1 tile
  protected moveSlimeWithBounce(slime: any, isWall: (c: number, r: number) => boolean) {
    if (!slime || slime.disabled) return;
    const step = (dir: Dir) => ({
      nsx: slime.pos.col + (dir === "left" ? -1 : dir === "right" ? 1 : 0),
      nsy: slime.pos.row + (dir === "up" ? -1 : dir === "down" ? 1 : 0),
    });
    let { nsx, nsy } = step(slime.dir);
    if (isWall(nsx, nsy)) {
      slime.dir = slime.dir === "left" ? "right" : slime.dir === "right" ? "left" : slime.dir === "up" ? "down" : "up";
      ({ nsx, nsy } = step(slime.dir));
    }
    slime.obj?.moveTo({ col: nsx, row: nsy }, slime.dir as Dir);
    slime.pos = { col: nsx, row: nsy };
  }

  // Hook: after player and slimes have moved
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onAfterProceed(key?: Dir): void { /* default noop */ }

  // Hook: allow subclass to override player's next target tile (e.g., ignore input)
  // Return null to use default based on input key
  // If returns {nx,ny}, that position is used for tag calculation and movement
  // Subclass must ensure it's a valid tile (or same tile) according to its rules
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected computeNextPlayerTarget(key: Dir): { nx: number; ny: number } | null { return null; }

  // Hook: whether slime collision should be considered this turn
  protected canCollideWithSlime(): boolean { return true; }

  // Hook: whether this input should consume a move from MOVE_LIMIT
  protected shouldConsumeMove(): boolean { return true; }

  preload() {
    this.load.tilemapTiledJSON(this.getMapKey(), `/map/${this.getMapKey().replace("map.", "")}.json`);
  }

  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#0b0b53");

    const map = this.make.tilemap({ key: this.getMapKey() });
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

    // Hard reset transient state on scene start (refresh or restart)
    this.patchLocked = false;
    this.patches = [];
    this.isMoving = false;
    this.repeatFlag = false;
    this.forcedDir = null;
    this.pendingSlimeHitDir = null;

    this.gameSetting = this.getPositions();
    const dirs = this.getInitialSlimeDirs();

    const presence = this.getPresence();
    this.entitys = {
      player: { obj: new Player(this, { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row }), disabled: false, pos: { col: this.gameSetting.SPAWN_POS.col, row: this.gameSetting.SPAWN_POS.row } },
      door: { obj: new Door(this, { col: this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row }, this.gameSetting.HAS_KEY), disabled: false, pos: { col: this.gameSetting.GOAL_POS.col, row: this.gameSetting.GOAL_POS.row } },
      slime1: presence.slime1 ? { obj: new Slime(this, { col: this.gameSetting.SLIME1_POS.col, row: this.gameSetting.SLIME1_POS.row }), disabled: false, dir: dirs.slime1, pos: { col: this.gameSetting.SLIME1_POS.col, row: this.gameSetting.SLIME1_POS.row } } : undefined,
      slime2: presence.slime2 ? { obj: new Slime(this, { col: this.gameSetting.SLIME2_POS.col, row: this.gameSetting.SLIME2_POS.row }), disabled: false, dir: dirs.slime2, pos: { col: this.gameSetting.SLIME2_POS.col, row: this.gameSetting.SLIME2_POS.row } } : undefined,
      box: presence.box ? { obj: new Box(this, { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row }), disabled: false, pos: { col: this.gameSetting.BOX_POS.col, row: this.gameSetting.BOX_POS.row } } : undefined,
      key: presence.key ? { obj: new Key(this, { col: this.gameSetting.KEY_POS.col, row: this.gameSetting.KEY_POS.row }), disabled: false, pos: { col: this.gameSetting.KEY_POS.col, row: this.gameSetting.KEY_POS.row } } : undefined,
    };
    this.isMoving = false;

    const eventBus = (this.scene.get("game") as GameScene).eventBus;
    const gameEventBus = (this.scene.get("game") as GameScene).gameEventBus;

    // Init UI: remaining moves at stage start
    eventBus.emit("ui:moves", this.gameSetting.MOVE_LIMIT);

    // Patchnote UI
    const availablePatches = this.getAvailablePatches();
    // Notify UI whether patch selection is currently possible
    const selectable = availablePatches.length > 0 && !this.patchLocked;
    eventBus.emit("patch:availability", selectable);
    // Only open patchnote UI when this stage provides patches
    if (availablePatches.length > 0) {
      eventBus.on("note:open", () => {
        this.scene.launch("patchnote-ui", {
          patches: availablePatches,
          selected: this.patches,
          locked: this.patchLocked,
          maxPatches: this.getMaxSelectablePatches(),
        });
        this.scene.bringToTop("patchnote-ui");
      });
    }

    // Input handling
    this.repeatFlag = false; // for patch(2) auto-repeat
    this.input.keyboard?.addCapture(["UP", "DOWN", "LEFT", "RIGHT"]);
    const onKey = (k: Dir) => {
      if (this.patches.includes(2)) this.repeatFlag = true;
      const keyToSend = (this.patches.includes(5) && this.forcedDir) ? (this.forcedDir as Dir) : k;
      gameEventBus.emit("game:input", keyToSend);
    };
    this.input.keyboard?.on("keydown-UP", () => onKey("up"));
    this.input.keyboard?.on("keydown-DOWN", () => onKey("down"));
    this.input.keyboard?.on("keydown-LEFT", () => onKey("left"));
    this.input.keyboard?.on("keydown-RIGHT", () => onKey("right"));
    // no attack key

    // Helpers
    const isDoor = (col: number, row: number) => col === this.entitys.door.pos.col && row === this.entitys.door.pos.row && this.gameSetting.HAS_KEY;
    const isKey = (col: number, row: number) => this.entitys.key && col === this.entitys.key.pos.col && row === this.entitys.key.pos.row && !this.entitys.key.disabled;
    const isWall = (col: number, row: number) => this.searchLayer(col, row).includes("wall") || this.searchLayer(col, row).includes("pillardown");
    const isBox = (col: number, row: number) => this.entitys.box && col === this.entitys.box.pos.col && row === this.entitys.box.pos.row && this.entitys.box.disabled === false;
    const isPillarUp = (col: number, row: number) => this.searchLayer(col, row).includes("pillarup");
    const isVoid = (col: number, row: number) => this.searchLayer(col, row).includes("void");

    gameEventBus.on("game:input", (key: Dir) => {
      this.patchLocked = true;
      // once input happens, patches can no longer be changed
      eventBus.emit("patch:availability", false);
      if (this.isMoving) return; this.isMoving = true;

      const deltas: Record<Dir, { dc: number; dr: number }> = {
        left: { dc: -1, dr: 0 }, right: { dc: 1, dr: 0 }, up: { dc: 0, dr: -1 }, down: { dc: 0, dr: 1 },
      };
      const override = this.computeNextPlayerTarget(key);
      const { dc, dr } = deltas[key];
      const nx = override ? override.nx : (this.entitys.player.pos.col + dc);
      const ny = override ? override.ny : (this.entitys.player.pos.row + dr);

      let [nsx1, nsy1, nsx2, nsy2] = this.precomputeSlimeNextTargets(isWall);

      // Stage hook before tag evaluation (e.g., visuals)
      this.onPreTags(nx, ny, nsx1, nsy1, nsx2, nsy2);

      const isSlime = (col: number, row: number) =>
        (this.entitys.slime1 && !this.entitys.slime1.disabled && (col === nsx1 && row === nsy1)) ||
        (this.entitys.slime2 && !this.entitys.slime2.disabled && (col === nsx2 && row === nsy2));

      const tags: string[] = [];
      if (isDoor(nx, ny)) {
        eventBus.emit("game:clear");
        this.isMoving = false;
        return;
      }
      if (isWall(nx, ny)) {
        if (this.patches.includes(5) && this.forcedDir) this.forcedDir = null; // stop forced chain when blocked
        this.isMoving = false;
        return;
      }
      if (isKey(nx, ny) && !isSlime(nx, ny)) tags.push("key");
      if (isBox(nx, ny)) tags.push("box");
      if (this.canCollideWithSlime() && isSlime(nx, ny)) {
        tags.push("slime");
        if (this.entitys.slime1 && (nx === nsx1 && ny === nsy1)) {
          this.pendingSlimeHitDir = this.entitys.slime1.dir as Dir;
          this.pendingSlimeId = "slime1";
        } else if (this.entitys.slime2 && (nx === nsx2 && ny === nsy2)) {
          this.pendingSlimeHitDir = this.entitys.slime2.dir as Dir;
          this.pendingSlimeId = "slime2";
        }
      } else {
        this.pendingSlimeHitDir = null;
        this.pendingSlimeId = null;
      }

      gameEventBus.emit("game:proceed", nx, ny, tags, key);

      // Slime movement after player's turn
      if (this.entitys.slime1 && !this.entitys.slime1.disabled) this.moveSlimeWithBounce(this.entitys.slime1, isWall);
      if (this.entitys.slime2 && !this.entitys.slime2.disabled) this.moveSlimeWithBounce(this.entitys.slime2, isWall);

      // Foreground pillar fade logic
      if (isPillarUp(nx, ny)) {
        const upLayer = this.layers["pillarup"];
        const downLayer = this.layers["pillardown"];
        const upTile = upLayer?.getTileAt(nx, ny);
        if (upTile) upTile.setAlpha(0.5);
        const downTile = downLayer?.getTileAt(nx, ny + 1);
        if (downTile) downTile.setAlpha(0.5);
      } else {
        const upLayer = this.layers["pillarup"];
        const downLayer = this.layers["pillardown"];
        upLayer?.forEachTile((tile) => tile.setAlpha(1));
        downLayer?.forEachTile((tile) => tile.setAlpha(1));
      }

      if (this.shouldConsumeMove()) {
        this.gameSetting.MOVE_LIMIT -= 1;
        eventBus.emit("ui:moves", this.gameSetting.MOVE_LIMIT);
      }
      if (this.gameSetting.MOVE_LIMIT <= 0) {
        eventBus.emit("game:over");
        return;
      }
    });

    gameEventBus.on("game:proceed", async (nx: number, ny: number, tags: string[], key?: Dir) => {
      if (tags.includes("key") && this.entitys.key) {
        this.entitys.key.disabled = true;
        this.entitys.key.obj?.taken();
        gameEventBus.emit("game:key:taken");
      }

      if (tags.includes("slime")) {
        await this.handlePlayerSlimeCollision(nx, ny, key, {
          isWall,
          isBox,
          isVoid,
        });
      } else if (tags.includes("box") && this.entitys.box) {
        this.entitys.box.disabled = true;
        this.entitys.box.obj?.destroy();
      } else {
        // Avoid issuing a noop tween when staying in place (prevents conflicts with stage-driven moves)
        const curPos = this.entitys.player.pos;
        if (nx !== curPos.col || ny !== curPos.row) {
          await this.entitys.player.obj?.moveTo({ col: nx, row: ny });
          this.entitys.player.pos = { col: nx, row: ny };
        }
      }

      this.isMoving = false;

      // Allow stages to chain inputs, etc.
      this.onAfterProceed(key);
    });

    gameEventBus.on("game:key:taken", () => {
      this.gameSetting.HAS_KEY = true;
      this.entitys.door.obj?.open();
    });
  }

  protected async handlePlayerSlimeCollision(
    nx: number,
    ny: number,
    key: Dir | undefined,
    helpers: { isWall: (c: number, r: number) => boolean; isBox: (c: number, r: number) => boolean; isVoid: (c: number, r: number) => boolean },
  ): Promise<void> {
    const { isWall, isBox, isVoid } = helpers;
    // Default: move into collision tile, take damage, then push back to previous tile
    const prev = { col: this.entitys.player.pos.col, row: this.entitys.player.pos.row };
    await this.entitys.player.obj?.moveTo({ col: nx, row: ny });
    await this.entitys.player.obj?.damage();
    if (isVoid(prev.col, prev.row)) {
      await this.entitys.player.obj?.moveTo({ col: prev.col, row: prev.row });
      this.entitys.player.pos = { col: prev.col, row: prev.row };
      const eventBus = (this.scene.get("game") as GameScene).eventBus;
      eventBus.emit("game:over");
    } else if (!isWall(prev.col, prev.row) && !isBox(prev.col, prev.row)) {
      await this.entitys.player.obj?.moveTo({ col: prev.col, row: prev.row });
      this.entitys.player.pos = { col: prev.col, row: prev.row };
    } else {
      this.entitys.player.pos = { col: nx, row: ny };
    }
  }

  protected searchLayer(col: number, row: number) {
    const result: string[] = [];
    for (const ln in this.layers) {
      const layer = this.layers[ln];
      if (!layer) continue;
      const tile = layer.getTileAt(col, row);
      if (tile && tile.index != 0) result.push(ln);
    }
    return result;
  }
}
