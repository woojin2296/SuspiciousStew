import type Phaser from "phaser";

type FadeOpts = { duration?: number; color?: number };
type StartOpts = FadeOpts & { data?: any; minLoadingMs?: number };

// 안전하게 메인 카메라를 얻거나 새로 추가
function getMainCam(scene: Phaser.Scene) {
  const { width, height } = scene.scale;
  return scene.cameras?.main ?? scene.cameras.add(0, 0, width, height);
}

// RGB 분해
function rgb(color: number) {
  return [(color >> 16) & 255, (color >> 8) & 255, color & 255] as const;
}

export class SceneFlow {
  private static busy = false;

  static async fadeOut(scene: Phaser.Scene, opts: FadeOpts = {}) {
    const cam = getMainCam(scene);
    const dur = opts.duration ?? 300;
    const color = opts.color ?? 0x000000;
    const [r, g, b] = rgb(color);

    await new Promise<void>((res) => {
      // 이벤트 상수 대신 문자열 사용(버전 호환)
      cam.once("camerafadeoutcomplete", () => res());
      cam.fadeOut(dur, r, g, b);
    });
  }

  static async fadeIn(scene: Phaser.Scene, opts: FadeOpts = {}) {
    const cam = getMainCam(scene);
    const dur = opts.duration ?? 250;
    const color = opts.color ?? 0x000000;
    const [r, g, b] = rgb(color);

    await new Promise<void>((res) => {
      cam.once("camerafadeincomplete", () => res());
      cam.fadeIn(dur, r, g, b);
    });
  }

  static async startWithFade(scene: Phaser.Scene, key: string, opts: StartOpts = {}) {
    if (SceneFlow.busy) return;

    SceneFlow.busy = true;

    try {
      const { duration, color, data } = opts;

      await SceneFlow.fadeOut(scene, { duration, color });

      // 전환: 새 씬으로 교체
      scene.scene.start(key, data);

      // 새 씬 컨텍스트 확보
      const next = scene.scene.get(key) as Phaser.Scene | undefined;

      // 새 씬에서 페이드 인
      if (next) {
        await SceneFlow.fadeIn(next, { duration: Math.max(200, duration - 50), color });
      }
    } finally {
      SceneFlow.busy = false;
    }
  }

  static async switchWithFade(scene: Phaser.Scene, key: string, opts: StartOpts = {}) {
    if (SceneFlow.busy) return;
    SceneFlow.busy = true;
    try {
      const { duration = 300, color, data, minLoadingMs = 0 } = opts;

      if (!scene.cameras) {
        scene.scene.switch(key, data);
        return;
      }

      await SceneFlow.fadeOut(scene, { duration, color });

      // 전환: 기존 씬 유지, 타 씬 활성화
      scene.scene.switch(key, data);
      await SceneFlow.sleep(1);

      // 새 씬 컨텍스트 확보
      const next = scene.scene.get(key) as Phaser.Scene | undefined;

      // (선택 지연) 로딩 화면 제거: 최소 대기만 적용
      const t0 = performance.now();
      const remain = Math.max(0, (minLoadingMs ?? 0) - (performance.now() - t0));
      if (remain > 0) await SceneFlow.sleep(remain);

      // 새 씬에서 페이드 인
      if (next) {
        await SceneFlow.fadeIn(next, { duration: Math.max(200, duration - 50), color });
      }
    } finally {
      SceneFlow.busy = false;
    }
  }

  static async restartWithFade(scene: Phaser.Scene, opts: StartOpts = {}) {
    if (SceneFlow.busy) return;
    SceneFlow.busy = true;
    try {
      const { duration = 300, color, data, minLoadingMs = 0 } = opts;

      if (!scene.cameras) {
        scene.scene.restart(data);
        return;
      }

      await SceneFlow.fadeOut(scene, { duration, color });

      // 재시작(같은 씬 인스턴스, 디스플레이 리스트 리셋)
      scene.scene.restart(data);
      await SceneFlow.sleep(1);

      // 재시작된 씬 컨텍스트(동일 키)
      const key = scene.scene.key;
      const next = scene.scene.get(key) as Phaser.Scene | undefined;

      // (선택 지연) 로딩 화면 제거: 최소 대기만 적용
      const t0 = performance.now();
      const remain = Math.max(0, (minLoadingMs ?? 0) - (performance.now() - t0));
      if (remain > 0) await SceneFlow.sleep(remain);

      // 페이드 인은 재시작된 씬에서
      if (next) {
        await SceneFlow.fadeIn(next, { duration: Math.max(200, duration - 50), color });
      }
    } finally {
      SceneFlow.busy = false;
    }
  }

  static pause(scene: Phaser.Scene)  { if (!scene.scene.isPaused()) scene.scene.pause(); }
  static resume(scene: Phaser.Scene) { if (scene.scene.isPaused())  scene.scene.resume(); }

  private static sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}