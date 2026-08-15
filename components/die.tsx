"use client";

import { useEffect, useState } from "react";
import styles from "./die.module.css";

const PIP_MAP: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

interface DieProps {
  value: number;
  rolling?: boolean;
  delayMs?: number;
}

export function Die({ value, rolling = false, delayMs = 0 }: DieProps) {
  const [face, setFace] = useState(value);

  useEffect(() => {
    if (!rolling) {
      setFace(value);
      return;
    }

    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
      intervalId = window.setInterval(() => {
        setFace(Math.floor(Math.random() * 6) + 1);
      }, 70);
    }, delayMs);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [rolling, value, delayMs]);

  const pips = PIP_MAP[face] ?? PIP_MAP[1];

  return (
    <div
      className={`${styles.die} ${rolling ? styles.rolling : styles.landed}`}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-label={`Кубик ${rolling ? "крутится" : value}`}
    >
      {Array.from({ length: 9 }, (_, index) => {
        const slot = index + 1;
        return (
          <span
            key={slot}
            className={`${styles.cell} ${pips.includes(slot) ? styles.pip : ""}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
