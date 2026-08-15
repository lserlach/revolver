"use client";

import { ResetButton } from "./reset-button";
import styles from "./death-overlay.module.css";

interface DeathOverlayProps {
  onReset: () => void;
  text?: string;
}

export function DeathOverlay({
  onReset,
  text = "Боевой патрон оказался в этом слоте.",
}: DeathOverlayProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="death-title">
      <div className={styles.card}>
        <h2 id="death-title" className={styles.title}>
          Вы мертвы
        </h2>
        <p className={styles.text}>{text}</p>
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}
