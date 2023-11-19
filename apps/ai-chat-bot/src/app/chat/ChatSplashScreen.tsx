"use client";

import { Suspense, useEffect, useState } from "react";

type ChatSplashScreenProps = {
  delayMs: number;
  children: React.ReactNode;
};

export default function ChatSplashScreen({
  delayMs,
  children,
}: ChatSplashScreenProps) {
  return (
    <>
      <Suspense fallback={<Splash />}>
        <Splash unmountDelayMs={delayMs} />
        {children}
      </Suspense>
    </>
  );
}

function Splash({ unmountDelayMs }: { unmountDelayMs?: number }) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (unmountDelayMs == null) {
      return;
    }

    const timeout = setTimeout(() => {
      setShow(false);
    }, unmountDelayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [unmountDelayMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black
      ${show ? "" : "animate-hide-screen"}`}
      onAnimationEnd={() => {
        setMounted(false);
      }}
    >
      <div className="font-mono text-4xl font-semibold text-white">AIko</div>
      <div className="border-rainbow-right absolute bottom-0 h-1 w-full border-t"></div>
    </div>
  );
}
