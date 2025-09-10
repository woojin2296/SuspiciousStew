
export const Config = {
  resolution: { width: 320, height: 180 }, // 내부 논리 해상도(픽셀 아트 기준)
  pixelArt: true,
  physics: {
    system: "arcade" as const,
    arcade: { gravityY: 0, debug: false },
  },
};