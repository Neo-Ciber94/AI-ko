"use client";

import { useEffect, useState } from "react";

type ScreenLoadingProps = {
  delayMs: number;
};

export default function ScreenLoading({ delayMs }: ScreenLoadingProps) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [delayMs]);

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
