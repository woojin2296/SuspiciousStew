import * as Phaser from "phaser";
import { GameScene } from "../scenes/GameScene";

export class StageUiScene extends Phaser.Scene {
  constructor() { super("stage-ui"); }

  preload() {
    if (this.textures.exists("ui.DialogWindow") === false) this.load.image("ui.game.DialogWindow", "/ui/game/DialogWindow.png");
    if (this.textures.exists("ui.GameMask") === false) this.load.image("ui.game.GameMask", "/ui/game/GameMask.png");
    if (this.textures.exists("ui.NoteIcon") === false) this.load.image("ui.icon.NoteIcon", "/ui/icon/NoteIcon.png");
    if (this.textures.exists("ui.GameOutline") === false) this.load.image("ui.game.GameOutline", "/ui/game/GameOutline.png");
    if (this.textures.exists("ui.ReplayIcon") === false) this.load.image("ui.icon.ReplayIcon", "/ui/icon/ReplayIcon.png");
    if (!this.textures.exists("ui.font")) {
      this.load.bitmapFont("ui.font", "/font/font.png", "/font/font.fnt");
    }
  }

  async create() {
    const { width: w, height: h } = this.scale;

    let gameMaskObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.game.GameMask")) {
      const img = this.add.image(0,0, "ui.game.GameMask").setOrigin(0, 0).setTintFill(0x0a0a0a);
      gameMaskObj = img;
    }

    let gameOutlineObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.game.GameOutline")) {
      const img = this.add.image(w*0.5, 0, "ui.game.GameOutline").setOrigin(0.5, 0);
      gameOutlineObj = img;
    }

    let dialogWindowObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.game.DialogWindow")) {
      const img = this.add.image(w * 0.5, h - 10, "ui.game.DialogWindow").setOrigin(0.5, 1);
      dialogWindowObj = img;
    }

    let noteButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.icon.NoteIcon")) {
      const btn = this.add.image(w - 61, 8, "ui.icon.NoteIcon").setOrigin(1, 0).setInteractive({ useHandCursor: true });

      btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        const eventBus = (this.scene.get("game") as GameScene).eventBus;
        eventBus.emit("note:open");
      });

      noteButtonObj = btn;
    }

    let replayButtonObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.icon.ReplayIcon")) {
      const btn = this.add.image(w - 61, 26, "ui.icon.ReplayIcon").setOrigin(1, 0).setInteractive({ useHandCursor: true });

      btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
        const eventBus = (this.scene.get("game") as GameScene).eventBus;
        eventBus.emit("game:over");
      });

      replayButtonObj = btn;
    }

    let dialogTextObj: Phaser.GameObjects.BitmapText | undefined;
    dialogTextObj = this.add.bitmapText(70, h - 30, "ui.font", "", 16).setOrigin(0, 1).setName("ui.game.DialogText").setMaxWidth(400).setTint(0x000000);
    dialogTextObj.setText("hello");
  }

  public setDialog(text: string) {
    const dialogTextObj = this.children.getByName("ui.game.DialogText") as Phaser.GameObjects.Text;
    dialogTextObj.setText(text);
  }

  public setHPUI(hp: number) {

  }
}
