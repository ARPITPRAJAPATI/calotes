"use client";

import { useEffect } from "react";

export default function DeferredPWA() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      };

      if ("requestIdleCallback" in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(registerSW);
      } else {
        setTimeout(registerSW, 3000);
      }
    }
  }, []);

  return null;
}
