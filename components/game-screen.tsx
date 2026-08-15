"use client";

import { useEffect, useState } from "react";
import { lockLandscape } from "@/lib/orientation";
import { playBang, playClick, unlockSounds } from "@/lib/sounds";
import {
  createLiarShootApi,
  createPokerShootApi,
  runShootSequence,
} from "@/lib/shoot-sequence";
import { useGameModeStore } from "@/store/game-mode-store";
import { POKER_CHAMBER_COUNT, resolvePendingPokerShot, usePokerStore } from "@/store/poker-store";
import { resolvePendingShot, useRevolverStore } from "@/store/revolver-store";
import { BulletRack } from "./bullet-rack";
import { ConfirmDialog } from "./confirm-dialog";
import { DeathOverlay } from "./death-overlay";
import { ModeSwitch } from "./mode-switch";
import { OrientationGuard } from "./orientation-guard";
import { PokerHelp } from "./poker-help";
import { ResetButton } from "./reset-button";
import { Revolver } from "./revolver";
import styles from "./game-screen.module.css";

function finishPendingShots() {
  const liarResult = resolvePendingShot();
  const pokerResult = resolvePendingPokerShot();
  const result = liarResult !== "blocked" ? liarResult : pokerResult;

  if (result === "bang") {
    void playBang();
  }
  if (result === "click") {
    void playClick();
  }
}

export function GameScreen() {
  const mode = useGameModeStore((state) => state.mode);

  const liarUsed = useRevolverStore((state) => state.usedChambers);
  const liarLocked = useRevolverStore((state) => state.isLocked);
  const liarAnimating = useRevolverStore((state) => state.isAnimating);
  const liarSpinId = useRevolverStore((state) => state.spinId);
  const resetLiar = useRevolverStore((state) => state.reset);

  const bulletCount = usePokerStore((state) => state.bulletCount);
  const pokerLocked = usePokerStore((state) => state.isLocked);
  const pokerAnimating = usePokerStore((state) => state.isAnimating);
  const pokerSpinId = usePokerStore((state) => state.spinId);
  const addBullet = usePokerStore((state) => state.addBullet);
  const resetPoker = usePokerStore((state) => state.reset);

  const isPoker = mode === "poker";
  const isLocked = isPoker ? pokerLocked : liarLocked;
  const isAnimating = isPoker ? pokerAnimating : liarAnimating;
  const spinId = isPoker ? pokerSpinId : liarSpinId;
  const loadedChambers = isPoker
    ? Array.from({ length: POKER_CHAMBER_COUNT }, (_, index) => index < bulletCount)
    : liarUsed.map((used) => !used);

  const [showDeath, setShowDeath] = useState(false);
  const [confirmShot, setConfirmShot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setConfirmShot(false);
    setShowHelp(false);
  }, [mode]);

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
    const hydrate = (store: { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void } }) => {
      if (store.persist.hasHydrated()) {
        finishPendingShots();
      }
      return store.persist.onFinishHydration(() => {
        finishPendingShots();
      });
    };

    const unsubscribeLiar = hydrate(useRevolverStore);
    const unsubscribePoker = hydrate(usePokerStore);

    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        return;
      }
      finishPendingShots();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);

    const warm = () => {
      lockLandscape();
      void unlockSounds();
    };

    window.addEventListener("pointerdown", warm, { once: true });
    return () => {
      unsubscribeLiar();
      unsubscribePoker();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("pointerdown", warm);
    };
  }, []);

  const handleReset = () => {
    setConfirmShot(false);
    if (isPoker) {
      resetPoker();
      return;
    }
    resetLiar();
  };

  const handleShoot = () => {
    if (isLocked || isAnimating) {
      return;
    }

    if (isPoker) {
      setConfirmShot(true);
      return;
    }

    void runShootSequence(createLiarShootApi());
  };

  const handleConfirmShoot = () => {
    setConfirmShot(false);
    void runShootSequence(createPokerShootApi());
  };

  return (
    <OrientationGuard>
      <main className={`${styles.table} ${isLocked ? styles.dead : ""}`}>
        <header className={styles.top}>
          <ModeSwitch />
          {isPoker ? (
            <button
              className={styles.help}
              type="button"
              aria-label="Комбинации покера"
              onClick={() => {
                setShowHelp(true);
              }}
            >
              ?
            </button>
          ) : null}
        </header>

        <section className={styles.stage}>
          <Revolver isLocked={isLocked} isAnimating={isAnimating} onShoot={handleShoot} />
          <BulletRack loadedChambers={loadedChambers} isSpinning={isAnimating} spinId={spinId} />
        </section>

        <footer className={styles.bottom}>
          {showDeath ? null : (
            <>
              {isPoker ? (
                <ResetButton
                  onReset={() => {
                    addBullet();
                  }}
                  label={
                    bulletCount >= POKER_CHAMBER_COUNT
                      ? "Барабан полный"
                      : `Добавить пулю ${bulletCount}/${POKER_CHAMBER_COUNT}`
                  }
                  disabled={isLocked || isAnimating || bulletCount >= POKER_CHAMBER_COUNT}
                />
              ) : null}
              <ResetButton onReset={handleReset} />
            </>
          )}
        </footer>

        {showHelp ? (
          <PokerHelp
            onClose={() => {
              setShowHelp(false);
            }}
          />
        ) : null}

        {confirmShot ? (
          <ConfirmDialog
            title="Выстрелить?"
            text="Это нельзя отменить. Шанс зависит от числа пуль в барабане."
            confirmLabel="Выстрелить"
            cancelLabel="Отмена"
            onConfirm={handleConfirmShoot}
            onCancel={() => {
              setConfirmShot(false);
            }}
          />
        ) : null}

        {showDeath ? (
          <DeathOverlay
            onReset={handleReset}
            text={
              isPoker
                ? "Шанс не сыграл в твою пользу."
                : "Боевой патрон оказался в этом слоте."
            }
          />
        ) : null}
      </main>
    </OrientationGuard>
  );
}
