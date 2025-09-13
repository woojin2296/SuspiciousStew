import * as Phaser from "phaser";
import { Audio } from "@/game/core/Audio";
import { Config } from "@/game/core/Config";

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
    // Ensure Audio is initialized (in case this scene opens first in future)
    Audio.I().init(this);

    const { width: W, height: H } = this.scale;
    const panelW = Math.min(W * 0.88, 420);
    const panelH = Math.min(H * 0.88, 320);

    const panel = this.add.graphics();
    panel.fillStyle(0x0f1115, 0.96);
    Phaser.Geom.Rectangle.CenterOn(panel.fillRect(0, 0, panelW, panelH).getBounds(), W / 2, H / 2);
    panel.lineStyle(2, 0x2a3140, 1).strokeRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 8);

    const title = this.add.text(W / 2, H / 2 - panelH / 2 + 24, "설정", {
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
      const valueText = this.add.text(x + w + 8, yy, `${Math.round(init * 100)}%`, { fontFamily: "monospace", fontSize: "12px", color: "#a7b6c2" }).setOrigin(0, 0.5);

      cont.add([track, fill, handle, valueText]);

      const clamp = (v: number) => Math.max(0, Math.min(1, v));
      const apply = (v: number) => {
        const nx = x + w * v;
        fill.width = Math.max(1, w * v);
        handle.x = nx;
        valueText.setText(`${Math.round(v * 100)}%`);
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

    // Master slider
    makeLabel("마스터 볼륨", y);
    const sMaster = makeSlider(left, y, trackW, Audio.I().masterVolume, (v) => Audio.I().setMasterVolume(v));
    y += gap;

    // BGM slider
    makeLabel("배경음악(BGM)", y);
    const sBgm = makeSlider(left, y, trackW, Audio.I().bgmVolume, (v) => Audio.I().setBgmVolume(v));
    y += gap;

    // SFX slider
    makeLabel("효과음(SFX)", y);
    const sSfx = makeSlider(left, y, trackW, Audio.I().sfxVolume, (v) => Audio.I().setSfxVolume(v));

    // Mute toggle & Close
    const muteBtn = this.add.text(W / 2 - 60, H / 2 + panelH / 2 - 26, Audio.I().muted ? "음소거 해제" : "음소거", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#455a64",
      padding: { x: 8, y: 4 } as any,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    muteBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      Audio.I().toggleMute();
      muteBtn.setText(Audio.I().muted ? "음소거 해제" : "음소거");
    });

    const closeBtn = this.add.text(W / 2 + 60, H / 2 + panelH / 2 - 26, "닫기", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#263238",
      padding: { x: 8, y: 4 } as any,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.stop();
    });

    this.input.keyboard?.on("keydown-ESC", () => this.scene.stop());
  }
}

