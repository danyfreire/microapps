export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function captureInstallPrompt(event: Event): void {
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice.outcome === "accepted";
}
