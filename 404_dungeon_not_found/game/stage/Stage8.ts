import { BaseStage, StagePositions, Dir } from "./BaseStage";

// 임시 스테이지 8: 맵은 level6를 재사용, 엔티티/패치는 임시 배치
export class Stage8 extends BaseStage {
  constructor() { super("stage8"); }

  protected getMapKey(): string { return "map.level6"; }

  protected getPositions(): StagePositions {
    return {
      SPAWN_POS: { col: 10, row: 8 },
      GOAL_POS: { col: 9, row: 1 },
      SLIME1_POS: { col: 12, row: 5 },
      SLIME2_POS: { col: 7, row: 6 },
      BOX_POS: { col: 10, row: 7 },
      KEY_POS: { col: 9, row: 2 },
      HAS_KEY: false,
      PLAYER_HP: 3,
      MOVE_LIMIT: 14,
    } as StagePositions;
  }

  protected getInitialSlimeDirs(): { slime1: Dir; slime2: Dir } {
    return { slime1: "left", slime2: "up" };
  }

  protected getAvailablePatches(): number[] { return [1, 2]; }
  protected getMaxSelectablePatches(): number { return 1; }
}

