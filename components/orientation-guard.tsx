"use client";

import { useEffect, useState, type ReactNode } from "react";
import { lockLandscape } from "@/lib/orientation";
import styles from "./orientation-guard.module.css";

interface OrientationGuardProps {
  children: ReactNode;
}

export function OrientationGuard({ children }: OrientationGuardProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait)");
    const sync = () => {
      setIsPortrait(media.matches);
    };

    sync();
    media.addEventListener("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <>
      {children}
      {isPortrait ? (
        <div className={styles.overlay} onPointerDown={lockLandscape}>
          <div className={styles.card}>
            <span className={styles.phone} aria-hidden="true" />
            <p className={styles.title}>Поверните телефон</p>
            <p className={styles.hint}>Горизонтально — так держится револьвер</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
