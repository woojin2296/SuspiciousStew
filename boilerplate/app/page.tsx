"use client";
import { useEffect, useRef } from "react";

export default function GamePage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!hostRef.current || gameRef.current) return;

      const PhaserMod = await import("phaser");
      const Phaser = PhaserMod.default;

      const { BootScene } = await import("@/game/scenes/BootScene");
      const { MainScene } = await import("@/game/scenes/MainScene");
      const { MainUiScene } = await import("@/game/scenes/MainUiScene");
      const { Config } = await import("@/game/core/Config");

      if (!mounted) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current!,
        backgroundColor: "#FFFFFF",
        pixelArt: Config.pixelArt,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: Config.resolution.width,
          height: Config.resolution.height,
        },
        physics: Config.physics,
        scene: [BootScene, MainScene, MainUiScene],
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