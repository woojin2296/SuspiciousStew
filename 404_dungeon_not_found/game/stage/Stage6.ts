import { BaseStage, StagePositions, Dir } from "./BaseStage";

export class Stage6 extends BaseStage {
  constructor() { super("stage6"); }

  protected getMapKey(): string { return "map.level6"; }

  protected getPositions(): StagePositions {
    return {
      SPAWN_POS: { col: 10, row: 8 },
      GOAL_POS: { col: 9, row: 1 },
      SLIME1_POS: { col: 13, row: 5 },
      SLIME2_POS: { col: 12, row: 7 },
      BOX_POS: { col: 10, row: 7 },
      KEY_POS: { col: 9, row: 2 },
      HAS_KEY: false,
      PLAYER_HP: 3,
      MOVE_LIMIT: 13,
    };
  }

  protected getInitialSlimeDirs(): { slime1: Dir; slime2: Dir } {
    return { slime1: "left", slime2: "down" };
  }

  protected getAvailablePatches(): number[] { return [2, 5]; }
  protected getMaxSelectablePatches(): number { return 1; }

  // 시각 표시 제거(점 표시 없음)
  protected onPreTags(): void { /* no-op */ }

  protected onAfterProceed(key?: Dir): void {
    if (this.patches.includes(2) && this.repeatFlag && key) {
      const gameEventBus = (this.scene.get("game") as any).gameEventBus;
      gameEventBus.emit("game:input", key);
      this.repeatFlag = false;
    }
  }
}
