"use client";

import styles from "./reset-button.module.css";

interface ResetButtonProps {
  onReset: () => void;
  label?: string;
  disabled?: boolean;
}

export function ResetButton({ onReset, label = "Сбросить", disabled = false }: ResetButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onReset} disabled={disabled}>
      {label}
    </button>
  );
}
