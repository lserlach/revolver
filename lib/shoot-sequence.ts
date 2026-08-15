import { playBang, playClick, playSpin, unlockSounds } from "@/lib/sounds";
import { usePokerStore } from "@/store/poker-store";
import { useRevolverStore, type PullResult } from "@/store/revolver-store";

const INTRIGUE_DELAY_MS = 550;

interface ShootApi {
  beginSpin: () => boolean;
  pull: () => PullResult;
  endAnimation: () => void;
  getSpinId: () => number;
  hasPendingShot: () => boolean;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function runShootSequence(api: ShootApi): Promise<void> {
  if (!api.beginSpin()) {
    return;
  }

  const spinId = api.getSpinId();
  await unlockSounds();
  const spinDuration = await playSpin();
  await wait(spinDuration * 1000 + INTRIGUE_DELAY_MS);

  if (api.getSpinId() !== spinId) {
    return;
  }

  if (!api.hasPendingShot()) {
    api.endAnimation();
    return;
  }

  const result = api.pull();
  api.endAnimation();

  if (result === "bang") {
    void playBang();
    return;
  }

  if (result === "click") {
    void playClick();
  }
}

export function createLiarShootApi(): ShootApi {
  return {
    beginSpin: () => useRevolverStore.getState().beginSpin(),
    pull: () => useRevolverStore.getState().pull(),
    endAnimation: () => useRevolverStore.getState().endAnimation(),
    getSpinId: () => useRevolverStore.getState().spinId,
    hasPendingShot: () => useRevolverStore.getState().pendingShot,
  };
}

export function createPokerShootApi(): ShootApi {
  return {
    beginSpin: () => usePokerStore.getState().beginSpin(),
    pull: () => usePokerStore.getState().pull(),
    endAnimation: () => usePokerStore.getState().endAnimation(),
    getSpinId: () => usePokerStore.getState().spinId,
    hasPendingShot: () => usePokerStore.getState().pendingShot,
  };
}
