import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>();
  const canInstall = installEvent != null && installEvent.prompt != null;

  useEffect(() => {
    const handler = (e: Event) => {
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      beforeInstallEvent.preventDefault();
      setInstallEvent(beforeInstallEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!canInstall) {
    return null;
  }

  return (
    <button
      className="flex flex-row items-center gap-2 rounded-3xl border border-white/10 px-6 py-3 text-sm text-white"
      style={{
        boxShadow: "inset 0 -2px 3px rgba(255, 255, 255, 0.3)",
      }}
      onClick={() => {
        if (installEvent.prompt) {
          installEvent.prompt();
        }
      }}
    >
      <ArrowDownTrayIcon className="h-5 w-5 text-white/80" />
      <span>Install</span>
    </button>
  );
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}
