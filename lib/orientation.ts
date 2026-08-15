interface LockableOrientation {
  lock: (orientation: "landscape") => Promise<void>;
}

function isLockableOrientation(value: unknown): value is LockableOrientation {
  return (
    typeof value === "object" &&
    value !== null &&
    "lock" in value &&
    typeof value.lock === "function"
  );
}

export function lockLandscape(): void {
  if (typeof screen === "undefined" || !isLockableOrientation(screen.orientation)) {
    return;
  }

  void screen.orientation.lock("landscape").catch(() => undefined);
}
