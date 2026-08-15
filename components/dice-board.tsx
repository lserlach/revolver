"use client";

import { useState } from "react";
import { playDice, unlockSounds } from "@/lib/sounds";
import { MAX_DICE_COUNT, MIN_DICE_COUNT, useDiceStore } from "@/store/dice-store";
import { Die } from "./die";
import { ResetButton } from "./reset-button";
import styles from "./dice-board.module.css";

const ROLL_MS = 950;

export function DiceBoard() {
  const values = useDiceStore((state) => state.values);
  const lastCount = useDiceStore((state) => state.lastCount);
  const roll = useDiceStore((state) => state.roll);
  const reset = useDiceStore((state) => state.reset);
  const [count, setCount] = useState(lastCount);
  const [isRolling, setIsRolling] = useState(false);
  const hasRoll = values.length > 0;

  const handleRoll = () => {
    if (isRolling) {
      return;
    }

    roll(count);
    setIsRolling(true);
    void unlockSounds();
    void playDice();

    window.setTimeout(() => {
      setIsRolling(false);
    }, ROLL_MS);
  };

  return (
    <section className={styles.board}>
      {hasRoll ? (
        <div className={styles.dice} aria-label="Результат броска">
          {values.map((value, index) => (
            <Die
              key={`${index}-${value}-${lastCount}`}
              value={value}
              rolling={isRolling}
              delayMs={index * 45}
            />
          ))}
        </div>
      ) : (
        <div className={styles.form}>
          <p className={styles.label}>Сколько кубиков</p>
          <div className={styles.stepper}>
            <button
              className={styles.step}
              type="button"
              aria-label="Меньше"
              disabled={count <= MIN_DICE_COUNT}
              onClick={() => {
                setCount((current) => Math.max(MIN_DICE_COUNT, current - 1));
              }}
            >
              −
            </button>
            <span className={styles.count} aria-live="polite">
              {count}
            </span>
            <button
              className={styles.step}
              type="button"
              aria-label="Больше"
              disabled={count >= MAX_DICE_COUNT}
              onClick={() => {
                setCount((current) => Math.min(MAX_DICE_COUNT, current + 1));
              }}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {hasRoll ? (
          <ResetButton
            onReset={() => {
              reset();
              setCount(lastCount);
            }}
            disabled={isRolling}
          />
        ) : (
          <ResetButton onReset={handleRoll} label="Бросить" disabled={isRolling} />
        )}
      </div>
    </section>
  );
}
