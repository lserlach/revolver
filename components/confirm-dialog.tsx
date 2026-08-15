"use client";

import styles from "./confirm-dialog.module.css";

interface ConfirmDialogProps {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.card}>
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{text}</p>
        <div className={styles.actions}>
          <button className={styles.secondary} type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={styles.primary} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
