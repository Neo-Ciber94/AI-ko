"use client";

import { useEffect, useState } from "react";

type TextProgressionOptions = {
  texts: string[];
  delay?: number;
  enabled?: boolean;
};

export function useTextProgression({
  texts,
  delay = 500,
  enabled = true,
}: TextProgressionOptions) {
  if (texts.length === 0) {
    throw new Error("texts cannot be empty");
  }

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      setIndex((idx) => (idx + 1) % texts.length);
    }, delay);

    return () => {
      clearInterval(interval);
    };
  }, [delay, enabled, texts, texts.length]);

  return texts[index];
}
