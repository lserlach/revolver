import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameMode = "liar" | "poker";

interface GameModeState {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
}

export const useGameModeStore = create<GameModeState>()(
  persist(
    (set) => ({
      mode: "liar",
      setMode: (mode) => {
        set({ mode });
      },
    }),
    {
      name: "liars-bar-mode",
    },
  ),
);
