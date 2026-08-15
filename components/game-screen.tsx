"use client";

import { useEffect, useState } from "react";
import { lockLandscape } from "@/lib/orientation";
import { unlockSounds } from "@/lib/sounds";
import { useRevolverStore } from "@/store/revolver-store";
import { BulletRack } from "./bullet-rack";
import { DeathOverlay } from "./death-overlay";
import { OrientationGuard } from "./orientation-guard";
import { ResetButton } from "./reset-button";
import { Revolver } from "./revolver";
import styles from "./game-screen.module.css";

export function GameScreen() {
  const usedChambers = useRevolverStore((state) => state.usedChambers);
  const isLocked = useRevolverStore((state) => state.isLocked);
  const isAnimating = useRevolverStore((state) => state.isAnimating);
  const spinId = useRevolverStore((state) => state.spinId);
  const reset = useRevolverStore((state) => state.reset);
  const [showDeath, setShowDeath] = useState(false);

  useEffect(() => {
    if (!isLocked) {
      setShowDeath(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowDeath(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLocked, spinId]);

  useEffect(() => {
    const warm = () => {
      lockLandscape();
      void unlockSounds();
    };

    window.addEventListener("pointerdown", warm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", warm);
    };
  }, []);

  const handleReset = () => {
    reset();
  };

  return (
    <OrientationGuard>
      <main className={`${styles.table} ${isLocked ? styles.dead : ""}`}>
        <section className={styles.stage}>
          <Revolver />
          <BulletRack
            usedChambers={usedChambers}
            isSpinning={isAnimating}
            spinId={spinId}
          />
        </section>

        <footer className={styles.bottom}>
          {showDeath ? null : <ResetButton onReset={handleReset} />}
        </footer>

        {showDeath ? <DeathOverlay onReset={handleReset} /> : null}
      </main>
    </OrientationGuard>
  );
}
