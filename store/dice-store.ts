import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MIN_DICE_COUNT = 1;
export const MAX_DICE_COUNT = 12;

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice(count: number): number[] {
  return Array.from({ length: count }, rollDie);
}

function clampCount(value: number): number {
  return Math.min(MAX_DICE_COUNT, Math.max(MIN_DICE_COUNT, Math.floor(value)));
}

interface DiceProgress {
  values: number[];
  lastCount: number;
}

interface DiceState extends DiceProgress {
  roll: (count: number) => boolean;
  reset: () => void;
}

export const useDiceStore = create<DiceState>()(
  persist(
    (set) => ({
      values: [],
      lastCount: 2,

      roll: (count) => {
        const nextCount = clampCount(count);
        if (!Number.isFinite(nextCount)) {
          return false;
        }
        set({
          values: rollDice(nextCount),
          lastCount: nextCount,
        });
        return true;
      },

      reset: () => {
        set({ values: [] });
      },
    }),
    {
      name: "liars-bar-dice",
      partialize: (state) => ({
        values: state.values,
        lastCount: state.lastCount,
      }),
      merge: (persisted, current) => {
        const value = (persisted ?? {}) as Partial<DiceProgress>;
        const values = Array.isArray(value.values)
          ? value.values.filter((face) => face >= 1 && face <= 6).slice(0, MAX_DICE_COUNT)
          : [];
        return {
          ...current,
          values,
          lastCount: clampCount(value.lastCount ?? values.length ?? 2),
        };
      },
    },
  ),
);
