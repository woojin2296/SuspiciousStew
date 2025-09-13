import * as Phaser from "phaser";

export type MoveDir = "left" | "right" | "up" | "down";

export type InputEvent =
  | { type: "move"; dir: MoveDir }
  | { type: "esc" }
  | { type: "restart" };

export type KeyBindings = {
  left?: string[];   // KeyboardEvent.code (e.g., "ArrowLeft", "KeyA")
  right?: string[];  // e.g., "ArrowRight", "KeyD"
  up?: string[];     // e.g., "ArrowUp", "KeyW"
  down?: string[];   // e.g., "ArrowDown", "KeyS"
  esc?: string[];    // e.g., "Escape"
  restart?: string[];// e.g., "KeyR"
};

const DEFAULT_BINDS: Required<KeyBindings> = {
  left: ["ArrowLeft"],
  right: ["ArrowRight"],
  up: ["ArrowUp"],
  down: ["ArrowDown"],
  esc: ["Escape"],
  restart: ["KeyR"],
};

/**
 * Centralized, event-driven input manager (turn-based friendly):
 * - Emits semantic events instead of exposing raw keys
 * - Edge-trigger only (JustDown) so holding doesn't repeat
 */
export class Input extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private keys = new Map<string, Phaser.Input.Keyboard.Key>(); // code -> key
  private binds: Required<KeyBindings>;

  constructor(scene: Phaser.Scene, binds: KeyBindings = {}) {
    super();
    this.scene = scene;
    this.binds = { ...DEFAULT_BINDS, ...binds };

    this.installKeys();
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  private installKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    const all = new Set<string>();
    Object.values(this.binds).forEach(list => list.forEach(c => all.add(c)));
    for (const code of all) {
      const kc = codeToKeyCode(code);
      if (kc == null) continue;
      if (!this.keys.has(code)) this.keys.set(code, kb.addKey(kc, false));
    }
  }

  private anyDown(codes: string[]) { return codes.some(c => this.keys.get(c)?.isDown); }
  private anyJustDown(codes: string[]) {
    return codes.some(c => {
      const k = this.keys.get(c);
      return k ? Phaser.Input.Keyboard.JustDown(k) : false;
    });
  }

  private onUpdate() {
    // Movement (edge-trigger, with opposite suppression)
    if (this.anyJustDown(this.binds.left) && !this.anyDown(this.binds.right)) this.emitEvent({ type: "move", dir: "left" });
    if (this.anyJustDown(this.binds.right) && !this.anyDown(this.binds.left)) this.emitEvent({ type: "move", dir: "right" });
    if (this.anyJustDown(this.binds.up) && !this.anyDown(this.binds.down)) this.emitEvent({ type: "move", dir: "up" });
    if (this.anyJustDown(this.binds.down) && !this.anyDown(this.binds.up)) this.emitEvent({ type: "move", dir: "down" });

    // ESC / Restart
    if (this.anyJustDown(this.binds.esc)) this.emitEvent({ type: "esc" });
    if (this.anyJustDown(this.binds.restart)) this.emitEvent({ type: "restart" });
  }

  private emitEvent(e: InputEvent) {
    this.emit(e.type, e);
  }

  override destroy(fromScene?: boolean): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    super.destroy(fromScene);
  }
}

export function attachInput(scene: Phaser.Scene, binds?: KeyBindings) {
  return new Input(scene, binds);
}

function codeToKeyCode(code: string): number | null {
  const K = Phaser.Input.Keyboard.KeyCodes as any;
  switch (code) {
    case "ArrowLeft": return K.LEFT;
    case "ArrowRight": return K.RIGHT;
    case "ArrowUp": return K.UP;
    case "ArrowDown": return K.DOWN;
    case "Escape": return K.ESC;
    default:
      // "KeyA" → "A"
      if (/^Key([A-Z])$/.test(code)) return K[code.slice(3)] ?? null;
      return null;
  }
}

