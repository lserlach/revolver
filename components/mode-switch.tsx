"use client";

import { useGameModeStore, type GameMode } from "@/store/game-mode-store";
import styles from "./mode-switch.module.css";

const MODES: { id: GameMode; label: string }[] = [
  { id: "liar", label: "Верю не верю" },
  { id: "poker", label: "Покер" },
  { id: "dice", label: "Кубики" },
];

export function ModeSwitch() {
  const mode = useGameModeStore((state) => state.mode);
  const setMode = useGameModeStore((state) => state.setMode);

  return (
    <div className={styles.switch} role="tablist" aria-label="Режим игры">
      {MODES.map((item) => (
        <button
          key={item.id}
          className={`${styles.tab} ${mode === item.id ? styles.active : ""}`}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          onClick={() => {
            setMode(item.id);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
