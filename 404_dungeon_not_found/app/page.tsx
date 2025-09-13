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
      const { Config } = await import("@/game/core/Config");

      if (!mounted) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current!,
        backgroundColor: "#FFFFFF",
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
        scene: [SplashScene, MainScene, SettingScene, GameScene],
      });

      onVis = () => gameRef.current?.loop.sleep(document.hidden);
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
