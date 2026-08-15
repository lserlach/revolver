"use client";

import styles from "./reset-button.module.css";

interface ResetButtonProps {
  onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onReset}>
      Сбросить
    </button>
  );
}
