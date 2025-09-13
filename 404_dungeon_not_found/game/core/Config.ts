export const Config = {
  resolution: { width: 640, height: 360 }, // 내부 논리 해상도(픽셀 아트 기준)
  pixelArt: true,
  physics: {
    default: "arcade" as const,
    arcade: { gravity: { y: 0 }, debug: false },
  },

  splash: {
    bgColor: "#FFFFFF",
    showDelayStartMs: 800,

    logoPath: "/ui/splash/studio-logo.png",
    logoMaxWidthRatio: 0.6,
    logoMaxWidthCap: 256,

    titleImagePath: "/ui/splash/studio-title.png",
    titleMaxWidthRatio: 0.6,
    titleMaxWidthCap: 256,

    spacing: 0,

    logoSlideMs: 1000,
    titleFadeMs: 1000,
    alphaDurationMs: 1000,
    easeAlpha: "Sine.easeOut",
    easeMove: "Sine.easeOut",

    showDelayEndMs: 4000,
    fadeOutMs: 500,
  },
  main: {
    titleImagePath: "/ui/main/game-title.jpg",
    titleMaxWidthRatio: 0.7,
    titleMaxWidthCap: 360,

    startButtonPath: "/ui/main/btn-start.png",
    settingsButtonPath: "/ui/main/btn-setting.png",
    buttonMaxWidthRatio: 0.3,
    buttonMaxWidthCap: 280,

    // Hover feedback
    hoverTint: 0xffffaa,
  },
};
