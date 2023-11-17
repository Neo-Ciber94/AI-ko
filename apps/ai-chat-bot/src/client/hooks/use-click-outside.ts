"use client";
import { RefObject, useEffect } from "react";

export function useClickOutside<T extends Element>({
  target,
  onClick,
}: {
  target: T | null | undefined | RefObject<T>;
  onClick: (event: MouseEvent) => void;
}) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = target instanceof Element ? target : target?.current;
      if (el && !el.contains(event.target as Node)) {
        onClick(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [target, onClick]);
}
