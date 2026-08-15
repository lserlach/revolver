import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CHAMBER_COUNT = 6;

export type PullResult = "click" | "bang" | "blocked";

interface RevolverProgress {
  chamberCount: typeof CHAMBER_COUNT;
  liveIndex: number;
  currentIndex: number;
  usedChambers: boolean[];
  isLocked: boolean;
  pendingShot: boolean;
  spinId: number;
}

interface RevolverState extends RevolverProgress {
  isAnimating: boolean;
  pull: () => PullResult;
  beginSpin: () => boolean;
  reset: () => void;
  endAnimation: () => void;
}

function randomLiveIndex(): number {
  return Math.floor(Math.random() * CHAMBER_COUNT);
}

function createFreshState(): Omit<RevolverProgress, "spinId"> & { isAnimating: boolean } {
  return {
    chamberCount: CHAMBER_COUNT,
    liveIndex: randomLiveIndex(),
    currentIndex: 0,
    usedChambers: Array.from({ length: CHAMBER_COUNT }, () => false),
    isLocked: false,
    pendingShot: false,
    isAnimating: false,
  };
}

function normalizeProgress(value: Partial<RevolverProgress>): Partial<RevolverProgress> {
  const used = value.usedChambers;
  if (!used || used.length !== CHAMBER_COUNT) {
    return createFreshState();
  }

  return {
    chamberCount: CHAMBER_COUNT,
    liveIndex: Math.min(value.liveIndex ?? 0, CHAMBER_COUNT - 1),
    currentIndex: Math.min(value.currentIndex ?? 0, CHAMBER_COUNT),
    usedChambers: used,
    isLocked: Boolean(value.isLocked),
    pendingShot: Boolean(value.pendingShot),
    spinId: value.spinId ?? 0,
  };
}

export const useRevolverStore = create<RevolverState>()(
  persist(
    (set, get) => ({
      ...createFreshState(),
      spinId: 0,

      beginSpin: () => {
        const { isLocked, isAnimating, currentIndex, chamberCount } = get();
        if (isLocked || isAnimating || currentIndex >= chamberCount) {
          return false;
        }
        set({ isAnimating: true, pendingShot: true });
        return true;
      },

      pull: () => {
        const { isLocked, currentIndex, liveIndex, chamberCount, usedChambers, pendingShot } =
          get();

        if (isLocked || currentIndex >= chamberCount || !pendingShot) {
          return "blocked";
        }

        const nextUsed = [...usedChambers];
        nextUsed[currentIndex] = true;
        const isLive = currentIndex === liveIndex;

        if (isLive) {
          set({
            usedChambers: nextUsed,
            isLocked: true,
            isAnimating: false,
            pendingShot: false,
          });
          return "bang";
        }

        set({
          usedChambers: nextUsed,
          currentIndex: currentIndex + 1,
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
      name: "liars-bar-revolver",
      partialize: (state) => ({
        chamberCount: state.chamberCount,
        liveIndex: state.liveIndex,
        currentIndex: state.currentIndex,
        usedChambers: state.usedChambers,
        isLocked: state.isLocked,
        pendingShot: state.pendingShot,
        spinId: state.spinId,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...normalizeProgress((persisted ?? {}) as Partial<RevolverProgress>),
        isAnimating: false,
      }),
    },
  ),
);

export function resolvePendingShot(): PullResult {
  const state = useRevolverStore.getState();
  if (!state.pendingShot || state.isAnimating || state.isLocked) {
    return "blocked";
  }
  return state.pull();
}
