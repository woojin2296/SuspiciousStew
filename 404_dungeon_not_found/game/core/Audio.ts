import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";

type BgmOpts = { volume?: number; loop?: boolean; fadeMs?: number; crossfadeMs?: number };
type SfxOpts = { volume?: number; rate?: number; detune?: number };

type Persist = { master: number; bgm: number; sfx: number; muted: boolean };

const STORE_KEY = "audio.settings.v1";

/**
 * Global Audio Manager
 * - Auto-loads audio declared in Config.audio
 * - Plays BGM globally with optional crossfade
 * - Plays SFX with master/music/sfx volume mix
 * - Pauses / resumes audio on visibility and scene pause/resume
 */
export class Audio extends Phaser.Events.EventEmitter {
  private static _i: Audio | null = null;
  static I(): Audio { return (this._i ??= new Audio()); }

  private scene?: Phaser.Scene;
  private sound?: Phaser.Sound.BaseSoundManager;
  private currentBgm?: Phaser.Sound.BaseSound;
  private currentBgmKey?: string;
  private pendingBgm?: { key: string; opts: BgmOpts } | null = null;

  private persist: Persist = { master: 1, bgm: 0.8, sfx: 1, muted: false };

  private constructor() {
    super();
    // load saved volumes
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) this.persist = { ...this.persist, ...JSON.parse(raw) };
    } catch {}
  }

  // -------------------- lifecycle --------------------
  init(scene: Phaser.Scene) {
    this.scene = scene;
    this.sound = scene.sound;
    this.applyVolumes();

    // visibility → pause/resume
    if (typeof document !== "undefined") {
      const onVis = () => (document.hidden ? this.pauseAll() : this.resumeAll());
      document.addEventListener("visibilitychange", onVis);
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        document.removeEventListener("visibilitychange", onVis);
      });
    }

    // scene pause/resume
    scene.events.on(Phaser.Scenes.Events.PAUSE, () => this.pauseAll());
    scene.events.on(Phaser.Scenes.Events.RESUME, () => this.resumeAll());

    // Unlock on first input if needed
    const unlock = () => {
      if (!this.sound) return;
      if (this.sound.locked) {
        this.sound.context.resume().catch(() => {});
      }
      if (this.pendingBgm) {
        const { key, opts } = this.pendingBgm;
        this.pendingBgm = null;
        this.playBgm(key, opts);
      }
      scene.input.off("pointerdown", unlock);
      scene.input.keyboard?.off("keydown", unlock as any);
    };
    scene.input.on("pointerdown", unlock);
    scene.input.keyboard?.on("keydown", unlock);
  }

  preloadFromConfig(scene: Phaser.Scene) {
    // BGM
    const bgm = Config.audio?.bgmMainPath;
    if (bgm) scene.load.audio("bgm.main", bgm);
    // Aliases for compatibility
    if (bgm) scene.load.audio("main-bgm", bgm);

    // SFX
    const s = Config.audio ?? ({} as any);
    if (s.sfxUiBtnPath) scene.load.audio("ui-click", s.sfxUiBtnPath);
    if (s.sfxStartBtnPath) scene.load.audio("ui-start", s.sfxStartBtnPath);
    if (s.sfxPlayerMovePath) scene.load.audio("player-move", s.sfxPlayerMovePath);
    if (s.sfxSlimeMovePath) scene.load.audio("slime-move", s.sfxSlimeMovePath);
  }

  // -------------------- volumes --------------------
  setMasterVolume(v: number) { this.persist.master = clamp01(v); this.applyVolumes(); }
  setBgmVolume(v: number)    { this.persist.bgm    = clamp01(v); this.applyVolumes(); }
  setSfxVolume(v: number)    { this.persist.sfx    = clamp01(v); this.save(); }
  muteAll(m = true)          { this.persist.muted  = m; this.applyVolumes(); }
  toggleMute()               { this.muteAll(!this.persist.muted); }

  get masterVolume() { return this.persist.master; }
  get bgmVolume()    { return this.persist.bgm; }
  get sfxVolume()    { return this.persist.sfx; }
  get muted()        { return this.persist.muted; }

  private applyVolumes() {
    if (!this.sound) return;
    this.sound.volume = this.persist.muted ? 0 : this.persist.master;
    if (this.currentBgm) this.currentBgm.setVolume(this.persist.muted ? 0 : this.persist.bgm);
    this.save();
  }

  private save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.persist)); } catch {}
  }

  // -------------------- playback --------------------
  playBgm(key: string, opts: BgmOpts = {}) {
    if (!this.scene || !this.sound) return;
    // load check
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`[Audio] BGM '${key}' not loaded`);
      return;
    }

    // locked → defer until unlocked
    if (this.sound.locked) {
      this.pendingBgm = { key, opts };
      return;
    }

    const loop = opts.loop ?? true;
    const targetVol = (this.persist.muted ? 0 : this.persist.bgm) * (opts.volume ?? 1);

    // If same track → adjust only
    if (this.currentBgmKey === key && this.currentBgm) {
      this.currentBgm.setVolume(targetVol);
      if (!this.currentBgm.isPlaying) this.currentBgm.play({ loop });
      return;
    }

    const next = this.sound.add(key, { loop, volume: 0 });
    const crossMs = opts.crossfadeMs ?? 400;
    const fadeMs  = opts.fadeMs ?? 300;

    // Crossfade with previous
    const prev = this.currentBgm;
    if (prev) {
      this.scene.tweens.add({ targets: prev, volume: 0, duration: crossMs, onComplete: () => prev.stop() });
    }

    next.play();
    this.scene.tweens.add({ targets: next, volume: targetVol, duration: fadeMs });
    this.currentBgm = next;
    this.currentBgmKey = key;
  }

  stopBgm(fadeMs = 200) {
    if (!this.scene || !this.currentBgm) return;
    const bgm = this.currentBgm;
    this.scene.tweens.add({ targets: bgm, volume: 0, duration: fadeMs, onComplete: () => bgm.stop() });
    this.currentBgm = undefined;
    this.currentBgmKey = undefined;
  }

  sfx(key: string, opts: SfxOpts = {}) {
    if (!this.scene || !this.sound) return;
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`[Audio] SFX '${key}' not loaded`);
      return;
    }
    const vol = (this.persist.muted ? 0 : this.persist.master * this.persist.sfx) * (opts.volume ?? 1);
    const snd = this.sound.add(key, { volume: vol, rate: opts.rate ?? 1, detune: opts.detune ?? 0 });
    snd.play();
    snd.once(Phaser.Sound.Events.COMPLETE, () => snd.destroy());
  }

  pauseAll() { this.sound?.pauseAll(); }
  resumeAll() { this.sound?.resumeAll(); }
}

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

