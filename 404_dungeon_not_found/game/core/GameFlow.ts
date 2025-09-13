import * as Phaser from "phaser";
import { attachInput, Input } from "@/game/core/Input";
import { Player } from "@/game/entity/Player";
import { Slime } from "@/game/entity/Slime";

export class GameFlow {
  private scene: Phaser.Scene;
  private input?: Input;
  private map!: Phaser.Tilemaps.Tilemap;
  private layers: Partial<Record<string, Phaser.Tilemaps.TilemapLayer>> = {};
  private tileSize = 16;
  private busy = false;

  private player!: Player;
  private slime?: Slime;

  static start(scene: Phaser.Scene) {
    const flow = new GameFlow(scene);
    flow.init();
    return flow;
  }

  private constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private init() {
    // Build tilemap (assumes preload in scene)
    this.map = this.scene.make.tilemap({ key: "map.testlevel" });
    const ts = this.map.addTilesetImage("grass", "tiles.grass");
    if (!ts) {
      this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, "Tileset not found", { fontFamily: "monospace", fontSize: "14px", color: "#ff8080" }).setOrigin(0.5);
      return;
    }

    // Layers
    ["void", "floor", "wall", "goal"].forEach((ln) => {
      if (this.map.getLayerIndex(ln) !== -1) {
        this.layers[ln] = this.map.createLayer(ln, ts, 0, 0) || undefined;
      }
    });

    // Camera
    const cam = this.scene.cameras.main;
    cam.setBackgroundColor("#000");
    cam.setRoundPixels(true);
    cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    const vw = this.scene.scale.width, vh = this.scene.scale.height;
    const zoom = Math.min(vw / this.map.widthInPixels, vh / this.map.heightInPixels);
    cam.setZoom(zoom);
    cam.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);

    // Grid size
    this.tileSize = this.map.tileWidth || 16;

    // Spawns
    const pSpawn = this.getSpawnFromObjects(["spawn", "spawns", "objects"], ["Player", "player"]) || this.findSpawnFallback();
    const sSpawn = this.getSpawnFromObjects(["spawn", "spawns", "objects"], ["Slime", "slime"]) || this.findNearFree(pSpawn.col, pSpawn.row);

    // Entities
    this.player = new Player(this.scene, this.tileSize, (c, r) => this.canPass(c, r));
    this.player.spawnAt(pSpawn.col, pSpawn.row);
    this.slime = new Slime(this.scene, this.tileSize, (c, r) => this.canPass(c, r));
    this.slime.spawnAt(sSpawn.col, sSpawn.row);

    // Input
    this.input = attachInput(this.scene);
    this.input.on("esc", () => this.openSettings());
    this.input.on("restart", () => this.scene.scene.restart());
    this.input.on("move", ({ dir }) => this.onMove(dir));

    // Cleanup
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input?.destroy();
    });
  }

  // --- Flow helpers ---
  private openSettings() {
    this.scene.scene.launch("settings");
    this.scene.scene.pause();
  }

  private async onMove(dir: "left" | "right" | "up" | "down") {
    if (!this.player || this.busy) return;
    if (this.player.isBusy()) return;
    this.busy = true;
    await this.player.tryMove(dir, 90);
    await this.slime?.react(90);
    this.busy = false;
  }

  // --- Map helpers ---
  private inBounds(c: number, r: number) {
    return c >= 0 && r >= 0 && c < this.map.width && r < this.map.height;
  }
  private canPass(c: number, r: number) {
    if (!this.inBounds(c, r)) return false;
    const wall = this.layers["wall"]?.getTileAt(c, r);
    return !(wall && wall.index && wall.index !== -1);
  }

  private getSpawnFromObjects(layerNames: string[], names: string[]) {
    // Try by layer name; Phaser stores object layers in map.objects
    for (const ln of layerNames) {
      const layer = (this.map as any).getObjectLayer?.(ln) || (this.map as any).objects?.find((l: any) => l.name === ln);
      const objects = layer?.objects as Array<any> | undefined;
      if (!objects) continue;
      const obj = objects.find((o) => names.includes(o.name) || names.includes(o.type));
      if (obj) {
        const col = Math.floor((obj.x ?? 0) / this.tileSize);
        const row = Math.floor((obj.y ?? 0) / this.tileSize);
        if (this.inBounds(col, row)) return { col, row };
      }
    }
    // Scan all object layers if any
    const groups = (this.map as any).objects as Array<any> | undefined;
    if (groups) {
      for (const g of groups) {
        const obj = (g.objects as Array<any>).find((o) => names.includes(o.name) || names.includes(o.type));
        if (obj) {
          const col = Math.floor((obj.x ?? 0) / this.tileSize);
          const row = Math.floor((obj.y ?? 0) / this.tileSize);
          if (this.inBounds(col, row)) return { col, row };
        }
      }
    }
    return undefined;
  }

  private findSpawnFallback(): { col: number; row: number } {
    const center = { col: Math.floor(this.map.width / 2), row: Math.floor(this.map.height / 2) };
    const maxR = Math.max(this.map.width, this.map.height);
    for (let d = 0; d <= maxR; d++) {
      for (let dc = -d; dc <= d; dc++) for (let dr = -d; dr <= d; dr++) {
        const c = center.col + dc, r = center.row + dr;
        if (!this.inBounds(c, r)) continue;
        if (this.canPass(c, r)) return { col: c, row: r };
      }
    }
    return { col: 0, row: 0 };
  }
  private findNearFree(c0: number, r0: number) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dx, dy] of dirs) {
      const c = c0 + dx, r = r0 + dy;
      if (this.canPass(c, r)) return { col: c, row: r };
    }
    return { col: c0, row: r0 };
  }
}

