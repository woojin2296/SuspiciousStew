import Phaser from "phaser";

export class MainUiScene extends Phaser.Scene {
  private label!: Phaser.GameObjects.Text;
  private label_main!: Phaser.GameObjects.Text;

  constructor() { super("ui"); }

  create() {

    const style = { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" };
    const { width: w, height: h } = this.scale;

    this.label_main = this.add.text(w / 2, h * 2 / 5, "Test game 1", { fontFamily: "monospace", fontSize: "32px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10_000)
      .setScale(0.5);


    this.label = this.add.text(w / 2, h * 3 / 4, "Click to start", { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10_000)
      .setScale(0.5);

    this.tweens.add({
      targets: this.label,
      alpha: 0,          // 최종값 (0까지 내려갔다가 다시 올라감)
      duration: 1000,    // 1초 동안
      yoyo: true,        // 다시 원래 alpha(=1)로
      repeat: -1,        // 무한 반복
      ease: "Sine.easeInOut"
    });


    // 화면 리사이즈 대응
    const onResize = () => {
      this.label.setPosition(this.scale.width / 2, this.scale.height * 3 / 4);
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, onResize);
      window.removeEventListener("click", onDom);
      window.removeEventListener("touchstart", onDom);
      window.removeEventListener("keydown", onDom);
    });

    // 어떤 입력이든 시작 처리
    const start = () => {
      // 오디오 컨텍스트 잠겨있으면 깨우기
      if (this.sound.locked) this.sound.context.resume().catch(() => { });

      // MainScene에 알림(이벤트)
      const main = this.scene.get("main") as Phaser.Scene;
      main?.events.emit("ui:start");

      // 텍스트 페이드아웃 후 제거
      this.tweens.add({
        targets: this.label,
        alpha: 0,
        duration: 200,
        onComplete: () => this.label.destroy(),
      });

      // 텍스트 페이드아웃 후 제거
      this.tweens.add({
        targets: this.label_main,
        alpha: 0,
        duration: 200,
        onComplete: () => this.label.destroy(),
      });
      // 리스너 정리
      this.input.off("pointerdown", start);
      this.input.keyboard?.off("keydown", start as any);
      window.removeEventListener("click", onDom);
      window.removeEventListener("touchstart", onDom);
      window.removeEventListener("keydown", onDom);
    };

    const onDom = () => start();
    this.input.once("pointerdown", start);
    this.input.keyboard?.once("keydown", start);
    window.addEventListener("click", onDom, { passive: true });
    window.addEventListener("touchstart", onDom, { passive: true });
    window.addEventListener("keydown", onDom, { passive: true });
  }
}