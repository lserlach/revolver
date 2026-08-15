import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PullResult } from "@/store/revolver-store";

export const POKER_CHAMBER_COUNT = 8;

interface PokerProgress {
  bulletCount: number;
  isLocked: boolean;
  pendingShot: boolean;
  spinId: number;
}

interface PokerState extends PokerProgress {
  chamberCount: typeof POKER_CHAMBER_COUNT;
  isAnimating: boolean;
  addBullet: () => boolean;
  beginSpin: () => boolean;
  pull: () => PullResult;
  reset: () => void;
  endAnimation: () => void;
}

function createFreshState(): Omit<PokerProgress, "spinId"> & { isAnimating: boolean } {
  return {
    bulletCount: 0,
    isLocked: false,
    pendingShot: false,
    isAnimating: false,
  };
}

export const usePokerStore = create<PokerState>()(
  persist(
    (set, get) => ({
      ...createFreshState(),
      chamberCount: POKER_CHAMBER_COUNT,
      spinId: 0,

      addBullet: () => {
        const { isLocked, isAnimating, bulletCount } = get();
        if (isLocked || isAnimating || bulletCount >= POKER_CHAMBER_COUNT) {
          return false;
        }
        set({ bulletCount: bulletCount + 1 });
        return true;
      },

      beginSpin: () => {
        const { isLocked, isAnimating } = get();
        if (isLocked || isAnimating) {
          return false;
        }
        set({ isAnimating: true, pendingShot: true });
        return true;
      },

      pull: () => {
        const { isLocked, bulletCount, pendingShot } = get();
        if (isLocked || !pendingShot) {
          return "blocked";
        }

        const chance = bulletCount / POKER_CHAMBER_COUNT;
        const isLive = bulletCount > 0 && Math.random() < chance;

        if (isLive) {
          set({
            isLocked: true,
            isAnimating: false,
            pendingShot: false,
          });
          return "bang";
        }

        set({
          isAnimating: false,
          pendingShot: false,
        });
        return "click";
      },

      reset: () => {
        set({
          ...createFreshState(),
          spinId: get().spinId + 1,
        });
      },

      endAnimation: () => {
        set({ isAnimating: false });
      },
    }),
    {
      name: "liars-bar-poker",
      partialize: (state) => ({
        bulletCount: state.bulletCount,
        isLocked: state.isLocked,
        pendingShot: state.pendingShot,
        spinId: state.spinId,
      }),
      merge: (persisted, current) => {
        const value = (persisted ?? {}) as Partial<PokerProgress>;
        return {
          ...current,
          bulletCount: Math.min(Math.max(value.bulletCount ?? 0, 0), POKER_CHAMBER_COUNT),
          isLocked: Boolean(value.isLocked),
          pendingShot: Boolean(value.pendingShot),
          spinId: value.spinId ?? 0,
          isAnimating: false,
        };
      },
    },
  ),
);

export function resolvePendingPokerShot(): PullResult {
  const state = usePokerStore.getState();
  if (!state.pendingShot || state.isAnimating || state.isLocked) {
    return "blocked";
  }
  return state.pull();
}
