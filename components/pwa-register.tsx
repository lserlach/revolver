"use client";

import { useEffect } from "react";
import { watchSoundSession } from "@/lib/sounds";

export function PwaRegister() {
  useEffect(() => {
    watchSoundSession();

    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
