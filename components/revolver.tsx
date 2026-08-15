"use client";

import Image from "next/image";
import { playBang, playClick, playSpin, unlockSounds } from "@/lib/sounds";
import { useRevolverStore } from "@/store/revolver-store";
import styles from "./revolver.module.css";

const INTRIGUE_DELAY_MS = 550;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function Revolver() {
  const beginSpin = useRevolverStore((state) => state.beginSpin);
  const pull = useRevolverStore((state) => state.pull);
  const endAnimation = useRevolverStore((state) => state.endAnimation);
  const isLocked = useRevolverStore((state) => state.isLocked);
  const isAnimating = useRevolverStore((state) => state.isAnimating);

  const handlePull = async () => {
    if (!beginSpin()) {
      return;
    }

    const spinId = useRevolverStore.getState().spinId;
    await unlockSounds();
    const spinDuration = await playSpin();
    await wait(spinDuration * 1000 + INTRIGUE_DELAY_MS);

    if (useRevolverStore.getState().spinId !== spinId) {
      return;
    }

    const result = pull();
    endAnimation();

    if (result === "bang") {
      void playBang();
      return;
    }

    if (result === "click") {
      void playClick();
    }
  };

  return (
    <button
      className={`${styles.trigger} ${isLocked ? styles.locked : ""}`}
      type="button"
      onClick={() => {
        void handlePull();
      }}
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
