import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  constructor() { super("main"); }

  async preload() {
    if (!(this.cache.tilemap as any).has("map.level1")) {
      this.load.tilemapTiledJSON("map.level1", "/assets/maps/level1.json");
    }
    if (!this.textures.exists("grass")) {
      this.load.image("grass", "/assets/TileMaps/Grass.png");
    }
    if (!this.textures.exists("grass_biome")) {
      this.load.image("grass_biome", "/assets/Objects/GrassBiome.png");
    }
    if (!this.textures.exists("water")) {
      this.load.image("water", "/assets/TileMaps/Water.png");
    }

    await new Promise<void>((resolve) => {
      this.load.once("complete", () => resolve());
      this.load.start();
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map.level1" });

    const tile_water = map.addTilesetImage("Water", "water")!;
    const tile_grass = map.addTilesetImage("Grass", "grass")!;
    const tile_biome = map.addTilesetImage("GrassBiome", "grass_biome")!;
  
    const water  = map.createLayer("Water",  tile_water, 0, 0)!;
    const ground = map.createLayer("Ground", tile_grass, 0, 0)!;
    const biome  = map.createLayer("Biome",  tile_biome, 0, 0)!;
  
    this.cameras.main.setBackgroundColor("#000");
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
    if (this.cache.audio.exists("bgm")) {
      this.bgm = this.sound.add("bgm", { loop: true, volume: 10 });
    }

    this.scene.launch("ui");

    this.events.once("ui:start", () => {
      if (this.bgm && !this.bgm.isPlaying) {
        this.bgm.play();
      }
    });
  }

  shutdown() {
    // 씬이 내려갈 때 bgm 정리
    if (this.bgm?.isPlaying) this.bgm.stop();
  }
}