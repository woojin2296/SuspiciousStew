import * as Phaser from "phaser";

export class PatchnoteUiScene extends Phaser.Scene {

  constructor() { super("patchnote-ui"); }

  preload() {
    if (this.textures.exists("ui.patchnote.PatchBase") === false) this.load.image("ui.patchnote.PatchBase", "/ui/patchnote/PatchBase.png");
    if (this.textures.exists("ui.patchnote.PatchClose") === false) this.load.image("ui.patchnote.PatchClose", "/ui/patchnote/PatchClose.png");

    if (this.textures.exists("ui.patchnote.Patch_Checkbox") === false) this.load.image("ui.patchnote.Patch_Checkbox", "/ui/patchnote/Patch_Checkbox.png");
    if (this.textures.exists("ui.patchnote.Patch_Checkbox1") === false) this.load.image("ui.patchnote.Patch_Checkbox1", "/ui/patchnote/Patch_Checkbox1.png");
    if (this.textures.exists("ui.patchnote.Patch_Checkbox2") === false) this.load.image("ui.patchnote.Patch_Checkbox2", "/ui/patchnote/Patch_Checkbox2.png");
    if (this.textures.exists("ui.patchnote.Patch_Check1") === false) this.load.image("ui.patchnote.Patch_Check1", "/ui/patchnote/Patch_Check1.png");
    if (this.textures.exists("ui.patchnote.Patch_Check2") === false) this.load.image("ui.patchnote.Patch_Check2", "/ui/patchnote/Patch_Check2.png");

    if (this.textures.exists("ui.patchnote.Patch1") === false) this.load.image("ui.patchnote.Patch1", "/ui/patchnote/Patch1.png");
    if (this.textures.exists("ui.patchnote.Patch2") === false) this.load.image("ui.patchnote.Patch2", "/ui/patchnote/Patch2.png");
    if (this.textures.exists("ui.patchnote.Patch3") === false) this.load.image("ui.patchnote.Patch3", "/ui/patchnote/Patch3.png");
    if (this.textures.exists("ui.patchnote.Patch4") === false) this.load.image("ui.patchnote.Patch4", "/ui/patchnote/Patch4.png");
    if (this.textures.exists("ui.patchnote.Patch5") === false) this.load.image("ui.patchnote.Patch5", "/ui/patchnote/Patch5.png");
    if (this.textures.exists("ui.patchnote.Patch6") === false) this.load.image("ui.patchnote.Patch6", "/ui/patchnote/Patch6.png");
    if (this.textures.exists("ui.patchnote.Patch7") === false) this.load.image("ui.patchnote.Patch7", "/ui/patchnote/Patch7.png");
    if (this.textures.exists("ui.patchnote.Patch8") === false) this.load.image("ui.patchnote.Patch8", "/ui/patchnote/Patch8.png");
    if (this.textures.exists("ui.patchnote.Patch9") === false) this.load.image("ui.patchnote.Patch9", "/ui/patchnote/Patch9.png");

    if (this.textures.exists("ui.patchnote.PatchSel1") === false) this.load.image("ui.patchnote.PatchSel1", "/ui/patchnote/PatchSel1.png");
    if (this.textures.exists("ui.patchnote.PatchSel2") === false) this.load.image("ui.patchnote.PatchSel2", "/ui/patchnote/PatchSel2.png");
    if (this.textures.exists("ui.patchnote.PatchSel3") === false) this.load.image("ui.patchnote.PatchSel3", "/ui/patchnote/PatchSel3.png");
    if (this.textures.exists("ui.patchnote.PatchSel4") === false) this.load.image("ui.patchnote.PatchSel4", "/ui/patchnote/PatchSel4.png");
    if (this.textures.exists("ui.patchnote.PatchSel5") === false) this.load.image("ui.patchnote.PatchSel5", "/ui/patchnote/PatchSel5.png");
    if (this.textures.exists("ui.patchnote.PatchSel6") === false) this.load.image("ui.patchnote.PatchSel6", "/ui/patchnote/PatchSel6.png");
    if (this.textures.exists("ui.patchnote.PatchSel7") === false) this.load.image("ui.patchnote.PatchSel7", "/ui/patchnote/PatchSel7.png");
    if (this.textures.exists("ui.patchnote.PatchSel8") === false) this.load.image("ui.patchnote.PatchSel8", "/ui/patchnote/PatchSel8.png");
    if (this.textures.exists("ui.patchnote.PatchSel9") === false) this.load.image("ui.patchnote.PatchSel9", "/ui/patchnote/PatchSel9.png");
  }

  create(data: { patches: number[]; selected: number[]; locked: boolean }) {
    
    const cam = this.cameras.main;
    let gameMaskObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.patchnote.PatchBase")) {
      const img = this.add.image(0, 0, "ui.patchnote.PatchBase").setOrigin(0, 0);
      gameMaskObj = img;
    }

    let dialogWindowObj: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists("ui.patchnote.PatchClose")) {
      const img = this.add.image(0, 0, "ui.patchnote.PatchClose").setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(20_000);
      dialogWindowObj = img;
    }

    dialogWindowObj?.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.stop("patchnote-ui");
    });

    this.setup(data.patches, data.selected, 1, data.locked, () => {}, );
  }
  public setup(
    patches: number[],
    selectedPathes: number[],
    maxPatches: number,
    patchLocked: boolean = false,
    onChange: (sel: number[]) => void = () => { },
  ) {
    const { width: w } = this.scale;

    // 배경 체크박스
    const bgKey =
      maxPatches === 2 ? "ui.patchnote.Patch_Checkbox" :
        maxPatches === 1 ? "ui.patchnote.Patch_Checkbox1" : null;
    if (bgKey && this.textures.exists(bgKey)) {
      this.add.image(0, 0, bgKey).setOrigin(0, 0).setDepth(15_000);
    }

    // 체크 마커(가시성만 쓰는 경우 유지)
    const check1Obj = this.textures.exists("ui.patchnote.Patch_Check1")
      ? this.add.image(0, 0, "ui.patchnote.Patch_Check1").setOrigin(0, 0).setName("check1").setDepth(15_000)
      : undefined;
    const check2Obj = this.textures.exists("ui.patchnote.Patch_Check2")
      ? this.add.image(0, 0, "ui.patchnote.Patch_Check2").setOrigin(0, 0).setName("check2").setDepth(15_000)
      : undefined;

    const updateChecks = () => {
      if (check1Obj) check1Obj.setVisible(selectedPathes.length >= 1);
      if (check2Obj) check2Obj.setVisible(selectedPathes.length >= 2);
    };

    // p -> 이미지 매핑 저장
    const itemMap = new Map<number, Phaser.GameObjects.Image>();

    // 선택 여부에 따라 텍스처 스왑
    const keyFor = (p: number, selected: boolean) => {
      const selKey = `ui.patchnote.PatchSel${p}`;
      const baseKey = `ui.patchnote.Patch${p}`;
      // 선택용 텍스처가 없으면 기본 텍스처를 그대로 사용
      return selected && this.textures.exists(selKey) ? selKey : baseKey;
    };

    const refreshTextures = () => {
      for (const [p, img] of itemMap) {
        const isSel = selectedPathes.includes(p);
        const key = keyFor(p, isSel);
        if (img.texture.key !== key) img.setTexture(key);
      }
    };

    // 패치 아이템 생성
    for (let i = 0; i < patches.length; i++) {
      const p = patches[i];
      const initialKey = keyFor(p, selectedPathes.includes(p));
      if (!this.textures.exists(initialKey)) continue;

      const img = this.add
        .image(0, 0, initialKey)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      img.setPosition(w * 0.5 - 4, 73 + (img.height + 8) * i);
      img.setDepth(80_000);

      itemMap.set(p, img);

      if (patchLocked) {
        img.on(Phaser.Input.Events.POINTER_DOWN, () => {
          this.tweens.add({ targets: img, x: img.x - 2, yoyo: true, repeat: 2, duration: 30 });
        });
      } else {
        img.on(Phaser.Input.Events.POINTER_DOWN, () => {
          const idx = selectedPathes.indexOf(p);

          if (idx >= 0) {
            // 토글 off
            selectedPathes.splice(idx, 1);
          } else if (selectedPathes.length < maxPatches) {
            // 토글 on
            selectedPathes.push(p);
          } else {
            // 꽉 찼을 때: 첫 선택을 교체하려면 아래처럼 교체 로직도 가능
            // selectedPathes.shift();
            // selectedPathes.push(p);

            // 아니면 흔들기만
            this.tweens.add({ targets: img, x: img.x - 2, yoyo: true, repeat: 2, duration: 30 });
          }

          // 텍스처/체크 갱신
          refreshTextures();
          updateChecks();

          onChange([...selectedPathes]);
        });
      }
    }

    // 초기 표시
    refreshTextures();
    updateChecks();

    return selectedPathes;
  }

}
