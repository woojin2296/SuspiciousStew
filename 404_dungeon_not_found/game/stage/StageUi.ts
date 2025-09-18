import * as Phaser from "phaser";
import { GameScene } from "../scenes/GameScene";

export class StageUiScene extends Phaser.Scene {
  constructor() { super("stage-ui"); }

  preload() {
    if (this.textures.exists("ui.game.DialogWindow") === false) this.load.image("ui.game.DialogWindow", "/ui/game/DialogWindow.png");
    if (this.textures.exists("ui.game.GameMask") === false) this.load.image("ui.game.GameMask", "/ui/game/GameMask.png");
    if (this.textures.exists("ui.icon.NoteIcon") === false) this.load.image("ui.icon.NoteIcon", "/ui/icon/NoteIcon.png");
    if (this.textures.exists("ui.game.GameOutline") === false) this.load.image("ui.game.GameOutline", "/ui/game/GameOutline.png");
    if (this.textures.exists("ui.icon.ReplayIcon") === false) this.load.image("ui.icon.ReplayIcon", "/ui/icon/ReplayIcon.png");
    if (this.textures.exists("ui.font") === false) {
      this.load.bitmapFont("ui.font", "/font/font.png", "/font/font.fnt");
    }
    if (this.textures.exists("ui.Notice") === false) this.load.image("ui.game.Notice", "/ui/game/Notice.png");
    if (this.textures.exists("ui.icon.NewNoteIcon") === false) this.load.image("ui.icon.NewNoteIcon", "/ui/icon/NewNoteIcon.png");
    // Preload patchnote assets to ensure immediate display
    if (this.textures.exists("ui.patchnote.PatchBase") === false) this.load.image("ui.patchnote.PatchBase", "/ui/patchnote/PatchBase.png");
    if (this.textures.exists("ui.patchnote.PatchClose") === false) this.load.image("ui.patchnote.PatchClose", "/ui/patchnote/PatchClose.png");
    if (this.textures.exists("ui.patchnote.Patch_Checkbox") === false) this.load.image("ui.patchnote.Patch_Checkbox", "/ui/patchnote/Patch_Checkbox.png");
    if (this.textures.exists("ui.patchnote.Patch_Checkbox1") === false) this.load.image("ui.patchnote.Patch_Checkbox1", "/ui/patchnote/Patch_Checkbox1.png");
    if (this.textures.exists("ui.patchnote.Patch_Checkbox2") === false) this.load.image("ui.patchnote.Patch_Checkbox2", "/ui/patchnote/Patch_Checkbox2.png");
    if (this.textures.exists("ui.patchnote.Patch_Check1") === false) this.load.image("ui.patchnote.Patch_Check1", "/ui/patchnote/Patch_Check1.png");
    if (this.textures.exists("ui.patchnote.Patch_Check2") === false) this.load.image("ui.patchnote.Patch_Check2", "/ui/patchnote/Patch_Check2.png");
    for (let i = 1; i <= 9; i++) {
      const baseKey = `ui.patchnote.Patch${i}`;
      const selKey = `ui.patchnote.PatchSel${i}`;
      if (this.textures.exists(baseKey) === false) this.load.image(baseKey, `/ui/patchnote/Patch${i}.png`);
      if (this.textures.exists(selKey) === false) this.load.image(selKey, `/ui/patchnote/PatchSel${i}.png`);
    }
    if (this.textures.exists("ui.number.b0") === false) this.load.image("ui.number.b0", "/ui/number/b0.png");
    if (this.textures.exists("ui.number.b1") === false) this.load.image("ui.number.b1", "/ui/number/b1.png");
    if (this.textures.exists("ui.number.b2") === false) this.load.image("ui.number.b2", "/ui/number/b2.png");
    if (this.textures.exists("ui.number.b3") === false) this.load.image("ui.number.b3", "/ui/number/b3.png");
    if (this.textures.exists("ui.number.b4") === false) this.load.image("ui.number.b4", "/ui/number/b4.png");
    if (this.textures.exists("ui.number.b5") === false) this.load.image("ui.number.b5", "/ui/number/b5.png");
    if (this.textures.exists("ui.number.b6") === false) this.load.image("ui.number.b6", "/ui/number/b6.png");
    if (this.textures.exists("ui.number.b7") === false) this.load.image("ui.number.b7", "/ui/number/b7.png");
    if (this.textures.exists("ui.number.b8") === false) this.load.image("ui.number.b8", "/ui/number/b8.png");
    if (this.textures.exists("ui.number.b9") === false) this.load.image("ui.number.b9", "/ui/number/b9.png");
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

    let noticeObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.game.Notice")) {
      const img = this.add.image(w*0.5, h*0.5, "ui.game.Notice").setOrigin(0.5, 0.5).setVisible(false).setDepth(20_000).setInteractive({ useHandCursor: true });
      noticeObj = img;
      img.on(Phaser.Input.Events.POINTER_DOWN, () => {
        img.setVisible(false);
        const eventBus = (this.scene.get("game") as GameScene).eventBus;
        eventBus.emit("game:restart");
      });
    }

    const eventBus = (this.scene.get("game") as GameScene).eventBus;
    eventBus.on("game:over", () => {
      if (noticeObj) noticeObj.setVisible(true);
    });
    // Swap note icon when patch selection is available (before first input)
    const updateNoteIcon = (selectable: boolean) => {
      if (!noteButtonObj) return;
      const key = selectable && this.textures.exists("ui.icon.NewNoteIcon")
        ? "ui.icon.NewNoteIcon" : "ui.icon.NoteIcon";
      if (noteButtonObj.texture.key !== key) noteButtonObj.setTexture(key);
    };
    eventBus.on("patch:availability", (v: boolean) => updateNoteIcon(v));

  }

  public setDialog(text: string) {
    const dialogTextObj = this.children.getByName("ui.game.DialogText") as Phaser.GameObjects.Text;
    dialogTextObj.setText(text);
  }

  public setHPUI(hp: number) {

  }
}
