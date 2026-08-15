"use client";

import Image from "next/image";
import styles from "./revolver.module.css";

interface RevolverProps {
  isLocked: boolean;
  isAnimating: boolean;
  onShoot: () => void;
}

export function Revolver({ isLocked, isAnimating, onShoot }: RevolverProps) {
  return (
    <button
      className={`${styles.trigger} ${isLocked ? styles.locked : ""}`}
      type="button"
      onClick={onShoot}
      disabled={isLocked || isAnimating}
      aria-label="Спустить курок"
    >
      <Image
        className={styles.photo}
        src="/images/revolver-cut.png"
        alt="Револьвер"
        width={1024}
        height={512}
        priority
        unoptimized
      />
    </button>
  );
}
