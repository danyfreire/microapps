"use client";

import { useEffect } from "react";
import { captureInstallPrompt } from "@/lib/pwa";

export function PwaRegister() {
  useEffect(() => {
    const onBeforeInstall = (event: Event) => captureInstallPrompt(event);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // El service worker es una mejora progresiva; no bloquea la app.
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  return null;
}
