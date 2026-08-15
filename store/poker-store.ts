import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PullResult } from "@/store/revolver-store";

export const POKER_CHAMBER_COUNT = 8;

interface PokerProgress {
  bulletCount: number;
  loadedForShot: number;
  isLocked: boolean;
  pendingShot: boolean;
  shotNonce: number;
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

function createFreshState(): Omit<PokerProgress, "spinId" | "shotNonce"> & { isAnimating: boolean } {
  return {
    bulletCount: 0,
    loadedForShot: 0,
    isLocked: false,
    pendingShot: false,
    isAnimating: false,
  };
}

export function rollPokerChamber(loadedCount: number, chamber = Math.floor(Math.random() * POKER_CHAMBER_COUNT)): boolean {
  return loadedCount > 0 && chamber < Math.min(loadedCount, POKER_CHAMBER_COUNT);
}

export const usePokerStore = create<PokerState>()(
  persist(
    (set, get) => ({
      ...createFreshState(),
      chamberCount: POKER_CHAMBER_COUNT,
      spinId: 0,
      shotNonce: 0,

      addBullet: () => {
        const { isLocked, isAnimating, bulletCount } = get();
        if (isLocked || isAnimating || bulletCount >= POKER_CHAMBER_COUNT) {
          return false;
        }
        set({ bulletCount: bulletCount + 1 });
        return true;
      },

      beginSpin: () => {
        const { isLocked, isAnimating, bulletCount } = get();
        if (isLocked || isAnimating) {
          return false;
        }
        set({
          isAnimating: true,
          pendingShot: true,
          loadedForShot: bulletCount,
          shotNonce: get().shotNonce + 1,
        });
        return true;
      },

      pull: () => {
        const { isLocked, pendingShot, loadedForShot } = get();
        if (isLocked || !pendingShot) {
          return "blocked";
        }

        const isLive = rollPokerChamber(loadedForShot);

        if (isLive) {
          set({
            isLocked: true,
            isAnimating: false,
            pendingShot: false,
          });
          return "bang";
        }

        set({
          bulletCount: 0,
          loadedForShot: 0,
          isAnimating: false,
          pendingShot: false,
          spinId: get().spinId + 1,
        });
        return "click";
      },

      reset: () => {
        set({
          ...createFreshState(),
          spinId: get().spinId + 1,
          shotNonce: get().shotNonce + 1,
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
        loadedForShot: state.loadedForShot,
        isLocked: state.isLocked,
        pendingShot: state.pendingShot,
        shotNonce: state.shotNonce,
        spinId: state.spinId,
      }),
      merge: (persisted, current) => {
        const value = (persisted ?? {}) as Partial<PokerProgress>;
        return {
          ...current,
          bulletCount: Math.min(Math.max(value.bulletCount ?? 0, 0), POKER_CHAMBER_COUNT),
          loadedForShot: Math.min(Math.max(value.loadedForShot ?? 0, 0), POKER_CHAMBER_COUNT),
          isLocked: Boolean(value.isLocked),
          pendingShot: Boolean(value.pendingShot),
          shotNonce: value.shotNonce ?? 0,
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
