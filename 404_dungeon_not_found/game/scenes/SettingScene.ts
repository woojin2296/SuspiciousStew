import * as Phaser from "phaser";
import { Config } from "@/game/core/Config";
import { SceneFlow } from "@/game/core/SceneFlow";
import { AudioManager } from "@/game/core/AudioManager";

type Slider = {
  container: Phaser.GameObjects.Container;
  set: (v: number) => void;
  get: () => number;
};

export class SettingScene extends Phaser.Scene {
  constructor() {
    super("settings");
  }

  create() {
    const audio = AudioManager.getInstance(this.game as Phaser.Game);
    const masterInit = audio.getMasterVolume();
    const bgmInit = audio.getBGMVolume();
    const sfxInit = audio.getSFXVolume();
    const mutedInit = audio.isMuted();
    this.sound.volume = masterInit;
    this.sound.mute = mutedInit;

    const { width: W, height: H } = this.scale;
    const panelW = Math.min(W * 0.90, 420);
    const panelH = Math.min(H * 0.90, 320);

    const panel = this.add.graphics();
    panel.fillStyle(0x0f1115);
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    panel.lineStyle(2, 0x2a3140, 1).strokeRoundedRect(panelX, panelY, panelW, panelH, 8);

    const title = this.add.text(W / 2, H / 2 - panelH / 2 + 24, "Setting", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff",
    }).setOrigin(0.5);

    const left = W / 2 - panelW / 2 + 24;
    const trackW = panelW - 48;
    let y = H / 2 - panelH / 2 + 70;
    const gap = 68;

    const makeLabel = (text: string, yy: number) =>
      this.add.text(left, yy - 20, text, { fontFamily: "monospace", fontSize: "12px", color: "#cfd8dc" }).setOrigin(0, 0.5);

    const makeSlider = (x: number, yy: number, w: number, init: number, onChange: (v: number) => void): Slider => {
      const cont = this.add.container(0, 0);
      const track = this.add.rectangle(x, yy, w, 8, 0x233042).setOrigin(0, 0.5).setInteractive();
      const fill = this.add.rectangle(x, yy, w * init, 8, 0x4cc3ff).setOrigin(0, 0.5);
      const handle = this.add.circle(x + w * init, yy, 8, 0xb3e5ff).setInteractive({ draggable: true, useHandCursor: true });
      
      cont.add([track, fill, handle]);

      const clamp = (v: number) => Math.max(0, Math.min(1, v));
      const apply = (v: number) => {
        const nx = x + w * v;
        fill.width = Math.max(1, w * v);
        handle.x = nx;
      };

      const set = (v: number) => {
        v = clamp(v);
        apply(v);
        onChange(v);
      };

      track.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
        const v = clamp((p.x - x) / w);
        set(v);
      });

      handle.on(Phaser.Input.Events.DRAG, (_p: Phaser.Input.Pointer, dragX: number) => {
        const v = clamp((dragX - x) / w);
        set(v);
      });
      this.input.setDraggable(handle);

      apply(init);
      return { container: cont, set, get: () => (handle.x - x) / w };
    };

    // Master slider → this.sound.volume + persist
    makeLabel("Master", y);
    const sMaster = makeSlider(left, y, trackW, masterInit, (v) => {
      this.sound.volume = v;
      audio.setMasterVolume(v);
    });
    y += gap;

    // BGM slider → adjust current bgm if exists + persist
    makeLabel("BGM", y);
    const sBgm = makeSlider(left, y, trackW, bgmInit, (v) => {
      audio.setBGMVolume(v);
      const bgm = this.sound.get("bgm.main") as Phaser.Sound.BaseSound | null;
      if (bgm) bgm.setVolume(audio.isMuted() ? 0 : audio.getMasterVolume() * v);
    });
    y += gap;

    // SFX slider → persist only, applied on play
    makeLabel("SFX", y);
    const sSfx = makeSlider(left, y, trackW, sfxInit, (v) => {
      audio.setSFXVolume(v);
    });

    // Mute toggle & Close
    const btnY = H / 2 + panelH / 2 - 26;
    const btnGap = 100;

    const muteBtn = this.add.text(W / 2, btnY, mutedInit ? "UNMUTE" : "MUTE", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#455a64",
      padding: { x: 8, y: 4 } as any,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    muteBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      AudioManager.getInstance(this.game).playSFX("audio.sfx.ui.UiButtonClick");
      const next = !audio.isMuted();
      audio.setMuted(next);
      this.sound.mute = next;
      muteBtn.setText(next ? "UNMUTE" : "MUTE");
    });

    const closeBtn = this.add.text(W / 2 + btnGap, btnY, "CLOSE", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#263238",
      padding: { x: 8, y: 4 } as any,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const closeAndResume = () => {
      // Resume game scene if paused
      const game = this.scene.get("game");
      if (game && this.scene.isPaused("game")) this.scene.resume("game");
      this.scene.stop();
    };

    closeBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      AudioManager.getInstance(this.game).playSFX("audio.sfx.ui.UiButtonClick");
      closeAndResume();
    });

    // (Back button removed)

    this.input.keyboard?.on("keydown-ESC", closeAndResume);
  }
}
