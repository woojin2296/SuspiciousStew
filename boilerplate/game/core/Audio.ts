import Phaser from "phaser";

type BgmOptions = {
  loop?: boolean;
  volume?: number;     // 0.0~1.0 (기본 0.8)
  fadeMs?: number;     // 재생/정지 페이드
  crossfadeMs?: number;// 다른 BGM으로 교체 시 크로스페이드
};

type SfxOptions = {
  volume?: number;     // 마스터 볼륨 * sfxVolume * 이 값
  rate?: number;
  detune?: number;
};

type Persist = {
  master: number;
  bgm: number;
  sfx: number;
  muted: boolean;
};

const KEY = "audio.settings.v1";

export class AudioManager {
  private static _i: AudioManager | null = null;
  static I(): AudioManager { return (this._i ??= new AudioManager()); }

  // ---- Phaser refs ----
  private _scene?: Phaser.Scene;           // 기준 씬(사운드 시스템/이벤트 접근용)
  private _sound?: Phaser.Sound.BaseSoundManager;
  private _unlocks: Array<() => void> = []; // 잠금 해제 후 실행할 콜백

  // ---- State ----
  private _currentBgm?: Phaser.Sound.BaseSound;
  private _currentBgmKey?: string;
  private _pendingBgm?: { key: string; opt: BgmOptions } | null = null;

  private _persist: Persist = { master: 1, bgm: 0.8, sfx: 1, muted: false };

  // ---- Init / attach ----
  init(scene: Phaser.Scene) {
    this._scene = scene;
    this._sound = scene.sound;

    // 로컬 설정 로드
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try { this._persist = { ...this._persist, ...JSON.parse(saved) }; } catch {}
    }
    this.applyVolumes();

    // visibility change → 자동 일시정지/재개 (원하면 주석)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!this._sound) return;
        if (document.hidden) this.pauseAll();
        else this.resumeAll();
      });
    }

    // 입력 한 번으로 오디오 언락
    this.installUnlockHandlers(scene);
  }

  // ---- Persistence ----
  private save() { localStorage.setItem(KEY, JSON.stringify(this._persist)); }
  setMasterVolume(v: number) { this._persist.master = clamp01(v); this.applyVolumes(); }
  setBgmVolume(v: number)    { this._persist.bgm    = clamp01(v); this.applyVolumes(); }
  setSfxVolume(v: number)    { this._persist.sfx    = clamp01(v); this.save(); }
  muteAll(m=true)  { this._persist.muted = m; this.applyVolumes(); }
  toggleMute()     { this.muteAll(!this._persist.muted); }

  get masterVolume() { return this._persist.master; }
  get bgmVolume()    { return this._persist.bgm; }
  get sfxVolume()    { return this._persist.sfx; }
  get muted()        { return this._persist.muted; }

  private applyVolumes() {
    const s = this._sound;
    if (!s) return;
    s.volume = this._persist.muted ? 0 : this._persist.master;
    if (this._currentBgm) this._currentBgm.setVolume(this._persist.muted ? 0 : this._persist.bgm);
    this.save();
  }

  // ---- Loading helpers (선택) ----
  /** Boot/Preload에서 호출: 여러 포맷 제공하여 브라우저 호환 */
  loadBgm(scene: Phaser.Scene, key: string, urls: string[] | string) {
    scene.load.audio(key, urls);
  }
  loadSfx(scene: Phaser.Scene, key: string, urls: string[] | string) {
    scene.load.audio(key, urls);
  }

  // ---- Playback ----
  /** BGM 재생(잠금이면 보류 후 첫 입력에 자동 재생) */
  playBgm(key: string, opt: BgmOptions = {}) {
    if (!this._scene || !this._sound) return;
    const scene = this._scene;

    // 아직 로드 안 됐으면 무시
    if (!scene.cache.audio.exists(key)) {
      console.warn(`[Audio] BGM '${key}' not in cache`);
      return;
    }

    // 잠금 상태면 보류
    if (this._sound.locked) {
      this._pendingBgm = { key, opt };
      return;
    }

    const loop = opt.loop ?? true;
    const vol  = (this._persist.muted ? 0 : this._persist.bgm) * (opt.volume ?? 1);

    // 기존 BGM과 같다면 볼륨만 보정
    if (this._currentBgmKey === key && this._currentBgm) {
      this._currentBgm.setVolume(vol);
      return;
    }

    const next = this._sound.add(key, { loop, volume: 0 });

    // 크로스페이드
    const crossMs = opt.crossfadeMs ?? 400;
    const fadeMs  = opt.fadeMs ?? 300;

    if (this._currentBgm && this._currentBgm.isPlaying && crossMs > 0) {
      const prev = this._currentBgm;
      next.play();
      this.fadeTo(next, vol, crossMs);
      this.fadeTo(prev, 0, crossMs).then(() => { prev.stop(); prev.destroy(); });
    } else {
      next.play();
      if (fadeMs > 0) this.fadeTo(next, vol, fadeMs);
      else next.setVolume(vol);
      if (this._currentBgm) { this._currentBgm.stop(); this._currentBgm.destroy(); }
    }

    this._currentBgm = next;
    this._currentBgmKey = key;
  }

  stopBgm(fadeMs = 200) {
    if (!this._currentBgm) return;
    const s = this._currentBgm;
    if (fadeMs > 0) {
      this.fadeTo(s, 0, fadeMs).then(() => { s.stop(); s.destroy(); });
    } else {
      s.stop(); s.destroy();
    }
    this._currentBgm = undefined;
    this._currentBgmKey = undefined;
  }

  /** one-shot SFX */
  playSfx(key: string, opt: SfxOptions = {}) {
    if (!this._scene || !this._sound) return;
    if (!this._scene.cache.audio.exists(key)) {
      console.warn(`[Audio] SFX '${key}' not in cache`);
      return;
    }
    const vol = (this._persist.muted ? 0 : this._persist.master * this._persist.sfx) * (opt.volume ?? 1);
    const s = this._sound.add(key, { volume: vol, rate: opt.rate, detune: opt.detune });
    s.once("complete", () => s.destroy());
    try { s.play(); } catch { s.destroy(); }
    return s;
  }

  /** ducking: BGM을 잠시 낮췄다가 복구 */
  async duckBgm(toVolume = 0.3, ms = 150) {
    if (!this._currentBgm) return;
    const original = this._currentBgm.volume;
    await this.fadeTo(this._currentBgm, toVolume, ms);
    return () => this.fadeTo(this._currentBgm!, original, ms);
  }

  // ---- Global control ----
  pauseAll()  { this._sound?.pauseAll(); }
  resumeAll() { this._sound?.resumeAll(); }

  // ---- Helpers ----
  private fadeTo(snd: Phaser.Sound.BaseSound, target: number, ms: number) {
    return new Promise<void>((res) => {
      const s = snd as Phaser.Sound.WebAudioSound | any;
      if (!s || typeof s.setVolume !== "function") { res(); return; }
      // Tween을 사용하면 끊김 없이 볼륨 변화
      this._scene?.tweens.add({
        targets: s,
        volume: Math.max(0, Math.min(1, target)),
        duration: ms,
        ease: "Linear",
        onComplete: () => res(),
      });
    });
  }

  private installUnlockHandlers(scene: Phaser.Scene) {
    const tryUnlock = () => {
      if (!this._sound) return;
      if (this._sound.locked) {
        this._sound.context.resume().catch(()=>{});
      }
      if (!this._sound.locked) {
        window.removeEventListener("click", tryUnlock);
        window.removeEventListener("touchstart", tryUnlock);
        window.removeEventListener("keydown", tryUnlock);
        // 대기 중이던 BGM 자동 실행
        if (this._pendingBgm) {
          const p = this._pendingBgm;
          this._pendingBgm = null;
          this.playBgm(p.key, p.opt);
        }
        // 지연 콜백 실행
        this._unlocks.forEach(fn => fn());
        this._unlocks.length = 0;
      }
    };

    window.addEventListener("click", tryUnlock, { passive: true });
    window.addEventListener("touchstart", tryUnlock, { passive: true });
    window.addEventListener("keydown", tryUnlock, { passive: true });

    // 씬 종료 시 정리
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("click", tryUnlock);
      window.removeEventListener("touchstart", tryUnlock);
      window.removeEventListener("keydown", tryUnlock);
    });
  }

  /** 오디오 잠금이 풀린 뒤 실행할 콜백 등록 */
  onUnlocked(cb: () => void) {
    if (!this._sound || !this._sound.locked) cb();
    else this._unlocks.push(cb);
  }
}

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }