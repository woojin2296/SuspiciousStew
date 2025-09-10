"use client";
import { useEffect, useRef } from "react";

export default function GamePage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>();

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!hostRef.current || gameRef.current) return;

      // ❗ 클라이언트에서만 동적 import
      const PhaserMod = await import("phaser");
      const Phaser = PhaserMod.default;

      const { BootScene } = await import("@/game/scenes/BootScene");
      const { MainScene } = await import("@/game/scenes/MainScene");
      const { Config } = await import("@/game/core/Config");

      if (!mounted) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current!,
        backgroundColor: "#000000",
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: Config.resolution.width,
          height: Config.resolution.height,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false },
        },
        scene: [BootScene, MainScene],
      });

      const onVis = () => gameRef.current?.loop.sleep(document.hidden);
      document.addEventListener("visibilitychange", onVis);

      // cleanup
      return () => {
        document.removeEventListener("visibilitychange", onVis);
      };
    })();

    return () => {
      mounted = false;
      gameRef.current?.destroy(true);
      gameRef.current = undefined;
    };
  }, []);

  return <div ref={hostRef} style={{ width: "100%", height: "100dvh" }} />;
}