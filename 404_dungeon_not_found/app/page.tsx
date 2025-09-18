"use client";
import { useEffect, useRef } from "react";
import type * as PhaserTypes from "phaser";

export default function GamePage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserTypes.Game | null>(null);

  useEffect(() => {
    let mounted = true;
    let onVis: (() => void) | undefined;

    (async () => {
      if (!hostRef.current || gameRef.current) return;

      const Phaser = (await import("phaser")) as typeof import("phaser");

      const { SplashScene } = await import("@/game/scenes/SplashScene");
      const { MainScene } = await import("@/game/scenes/MainScene");
      const { SettingScene } = await import("@/game/scenes/SettingScene");
      const { GameScene } = await import("@/game/scenes/GameScene");

      const { StageUiScene } = await import("@/game/stage/StageUi");
      const { PatchnoteUiScene } = await import("@/game/stage/PatchNoteUi");
      const { Stage1 } = await import("@/game/stage/Stage1");
      const { Stage2 } = await import("@/game/stage/Stage2");
      const { Stage3 } = await import("@/game/stage/Stage3");
      const { Stage4 } = await import("@/game/stage/Stage4");
      const { Stage6 } = await import("@/game/stage/Stage6");
      const { Stage8 } = await import("@/game/stage/Stage8");

      const { Config } = await import("@/game/core/Config");

      if (!mounted) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current!,
        backgroundColor: "#0b0b53",
        pixelArt: Config.pixelArt,
        antialias: false,
        roundPixels: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: Config.resolution.width,
          height: Config.resolution.height,
        },
        physics: Config.physics as any,
        // 기존 스테이지(2,3,4,6) 중심 + Stage8 유지
        scene: [
          SplashScene, MainScene, GameScene, SettingScene, StageUiScene, PatchnoteUiScene,
          Stage1, Stage2, Stage3, Stage4, Stage6, Stage8
        ],
      });

      onVis = () => {
        const g = gameRef.current;
        if (!g) return;
        if (document.hidden) {
          g.loop.sleep();
        } else {
          g.loop.wake();
        }
      };
      
      document.addEventListener("visibilitychange", onVis);
    })();

    return () => {
      mounted = false;
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} style={{ width: "100%", height: "100dvh" }} />;
}
