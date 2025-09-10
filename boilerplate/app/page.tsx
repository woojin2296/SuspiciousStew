import Image from "next/image";

export default function Home() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>Game Jam Starter</h1>
      <a href="/game">▶ Start Game</a>
      <p>Controls: Arrow keys. Press <kbd>P</kbd> to pause, <kbd>F1</kbd> for debug overlay.</p>
    </main>
  );
}