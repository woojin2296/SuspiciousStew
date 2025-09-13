import * as Phaser from "phaser";

export class AudioManager {
  private static instance: AudioManager | null = null;

  private game;

  private currentBGMKey: string | null = null;

  private masterVolume = 1;
  private bgmVolume = 1;
  private sfxVolume = 1;
  private muted = false;

  static getInstance(game: Phaser.Game) {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(game);
    }
    return AudioManager.instance;
  }

  constructor(game: Phaser.Game) {
    this.game = game;
    this.loadSettings();
  }

  private loadSettings() {
    const muted = localStorage.getItem("audio.muted");
    if (muted !== null) {
      this.muted = muted === "true";
    }
    const masterVolume = localStorage.getItem("audio.masterVolume");
    if (masterVolume !== null) {
      this.masterVolume = parseFloat(masterVolume);
    }
    const bgmVolume = localStorage.getItem("audio.bgmVolume");
    if (bgmVolume !== null) {
      this.bgmVolume = parseFloat(bgmVolume);
    }
    const sfxVolume = localStorage.getItem("audio.sfxVolume");
    if (sfxVolume !== null) {
      this.sfxVolume = parseFloat(sfxVolume);
    }
  }

  public playBGM(key: string) {
    if (this.currentBGMKey && this.currentBGMKey === key) return;
    const bgm = this.game.sound.play(key, { loop: true, volume: this.muted ? 0 : this.masterVolume * this.bgmVolume });
    this.currentBGMKey = key;
  }

  public playSFX(key: string) {
    this.game.sound.play(key, { volume: this.muted ? 0 : this.masterVolume * this.sfxVolume });
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = volume;
    localStorage.setItem("audio.masterVolume", volume.toString());
    this.updateVolumes();
  }

  public setBGMVolume(volume: number) {
    this.bgmVolume = volume;
    localStorage.setItem("audio.bgmVolume", volume.toString());
    this.updateVolumes();
  }

  public setSFXVolume(volume: number) {
    this.sfxVolume = volume;
    localStorage.setItem("audio.sfxVolume", volume.toString());
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    localStorage.setItem("audio.muted", muted.toString());
    this.updateVolumes();
  }

  // --- Getters for UI ---
  public getMasterVolume() { return this.masterVolume; }
  public getBGMVolume() { return this.bgmVolume; }
  public getSFXVolume() { return this.sfxVolume; }
  public isMuted() { return this.muted; }

  private updateVolumes() {
    const bgm = this.game.sound.get(this.currentBGMKey || "");
    if (bgm) {
      bgm.setVolume(this.muted ? 0 : this.masterVolume * this.bgmVolume);
    }
  }
}
