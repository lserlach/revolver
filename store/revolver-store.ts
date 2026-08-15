import { create } from "zustand";

export const CHAMBER_COUNT = 6;

export type PullResult = "click" | "bang" | "blocked";

interface RevolverState {
  chamberCount: typeof CHAMBER_COUNT;
  liveIndex: number;
  currentIndex: number;
  usedChambers: boolean[];
  isLocked: boolean;
  isAnimating: boolean;
  spinId: number;
  pull: () => PullResult;
  beginSpin: () => boolean;
  reset: () => void;
  endAnimation: () => void;
}

function randomLiveIndex(): number {
  return Math.floor(Math.random() * CHAMBER_COUNT);
}

function createFreshState(): Pick<
  RevolverState,
  | "chamberCount"
  | "liveIndex"
  | "currentIndex"
  | "usedChambers"
  | "isLocked"
  | "isAnimating"
> {
  return {
    chamberCount: CHAMBER_COUNT,
    liveIndex: randomLiveIndex(),
    currentIndex: 0,
    usedChambers: Array.from({ length: CHAMBER_COUNT }, () => false),
    isLocked: false,
    isAnimating: false,
  };
}

export const useRevolverStore = create<RevolverState>((set, get) => ({
  ...createFreshState(),
  spinId: 0,

  beginSpin: () => {
    const { isLocked, isAnimating, currentIndex, chamberCount } = get();
    if (isLocked || isAnimating || currentIndex >= chamberCount) {
      return false;
    }
    set({ isAnimating: true });
    return true;
  },

  pull: () => {
    const { isLocked, currentIndex, liveIndex, chamberCount, usedChambers } = get();

    if (isLocked || currentIndex >= chamberCount) {
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
      });
      return "bang";
    }

    set({
      usedChambers: nextUsed,
      currentIndex: currentIndex + 1,
      isAnimating: false,
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
}));
