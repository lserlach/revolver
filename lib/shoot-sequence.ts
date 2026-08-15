import { playBang, playClick, playSpin, unlockSounds } from "@/lib/sounds";
import { usePokerStore } from "@/store/poker-store";
import { useRevolverStore, type PullResult } from "@/store/revolver-store";

const INTRIGUE_DELAY_MS = 550;

interface ShootApi {
  beginSpin: () => boolean;
  pull: () => PullResult;
  endAnimation: () => void;
  getShotId: () => number;
  hasPendingShot: () => boolean;
  isDead: () => boolean;
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

  const shotId = api.getShotId();
  await unlockSounds();
  const spinDuration = await playSpin();
  await wait(spinDuration * 1000 + INTRIGUE_DELAY_MS);

  if (api.getShotId() !== shotId) {
    api.endAnimation();
    return;
  }

  if (!api.hasPendingShot()) {
    api.endAnimation();
    if (api.isDead()) {
      void playBang();
      return;
    }
    void playClick();
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
    getShotId: () => useRevolverStore.getState().spinId,
    hasPendingShot: () => useRevolverStore.getState().pendingShot,
    isDead: () => useRevolverStore.getState().isLocked,
  };
}

export function createPokerShootApi(): ShootApi {
  return {
    beginSpin: () => usePokerStore.getState().beginSpin(),
    pull: () => usePokerStore.getState().pull(),
    endAnimation: () => usePokerStore.getState().endAnimation(),
    getShotId: () => usePokerStore.getState().shotNonce,
    hasPendingShot: () => usePokerStore.getState().pendingShot,
    isDead: () => usePokerStore.getState().isLocked,
  };
}
