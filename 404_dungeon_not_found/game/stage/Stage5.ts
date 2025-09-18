import { BaseStage, StagePositions, Dir } from "./BaseStage";

export class Stage5 extends BaseStage {
  constructor() { super("stage5"); }

  protected getMapKey(): string { return "map.level5"; }

  protected getPositions(): StagePositions {
    return {
      SPAWN_POS: { col: 10, row: 8 },
      GOAL_POS: { col: 8, row: 1 },
      SKELETON1_POS: { col: 7, row: 2 },
      SKELETON2_POS: { col: 13, row: 3 },
      BOX1_POS: { col: 9, row: 8 },
      BOX2_POS: { col: 10, row: 5 },
      KEY_POS: { col: 6, row: 5 },
      BRIDGE1_POS: { col: 10, row: 7 },
      BRIDGE2_POS: { col: 11, row: 7 },
      HAS_KEY: false,
      PLAYER_HP: 3,
      MOVE_LIMIT: 99,
    };
  }

  protected getInitialSlimeDirs(): { slime1: Dir; slime2: Dir } {
    return { slime1: "down", slime2: "left" };
  }

  protected getAvailablePatches(): number[] { return [1, 2, 3, 4]; }
  protected getMaxSelectablePatches(): number { return 1; }

  protected precomputeSlimeNextTargets(isWall: (c: number, r: number) => boolean): [number, number, number, number] {
    const s1 = this.entitys.slime1;
    const s2 = this.entitys.slime2;
    const step = (dir: Dir) => ({
      dc: dir === "left" ? -1 : dir === "right" ? 1 : 0,
      dr: dir === "up" ? -1 : dir === "down" ? 1 : 0,
    });
    const d1 = step(s1.dir);
    const d2 = step(s2.dir);
    let nsx1 = s1.pos.col + d1.dc;
    let nsy1 = s1.pos.row + d1.dr;
    let nsx2 = s2.pos.col + d2.dc;
    let nsy2 = s2.pos.row + d2.dr;
    if (!this.patches.includes(1)) {
      if (isWall(nsx1, nsy1)) { nsx1 = s1.pos.col; nsy1 = s1.pos.row; }
      if (isWall(nsx2, nsy2)) { nsx2 = s2.pos.col; nsy2 = s2.pos.row; }
    }
    return [nsx1, nsy1, nsx2, nsy2];
  }

  protected moveSlimeWithBounce(slime: any, isWall: (c: number, r: number) => boolean) {
    const step = (dir: Dir) => ({
      nsx: slime.pos.col + (dir === "left" ? -1 : dir === "right" ? 1 : 0),
      nsy: slime.pos.row + (dir === "up" ? -1 : dir === "down" ? 1 : 0),
    });
    let { nsx, nsy } = step(slime.dir);
    if (!this.patches.includes(1)) {
      if (isWall(nsx, nsy)) {
        slime.dir = slime.dir === "left" ? "right" : slime.dir === "right" ? "left" : slime.dir === "up" ? "down" : "up";
        ({ nsx, nsy } = step(slime.dir));
        if (isWall(nsx, nsy)) { nsx = slime.pos.col; nsy = slime.pos.row; }
      }
    } else {
      // patch(1): ignore walls, just move forward
    }
    slime.obj?.moveTo({ col: nsx, row: nsy }, slime.dir as Dir);
    slime.pos = { col: nsx, row: nsy };
  }

  protected onAfterProceed(key?: Dir): void {
    if (this.patches.includes(2) && this.repeatFlag && key) {
      const gameEventBus = (this.scene.get("game") as any).gameEventBus;
      gameEventBus.emit("game:input", key);
      this.repeatFlag = false;
    }
  }
}
