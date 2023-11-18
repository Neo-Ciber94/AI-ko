import { useEffect } from "react";

type UseKeydownOptions = {
  keys: string[];
  onKeydown: (event: KeyboardEvent) => void;
};

export function useKeydown({ keys, onKeydown }: UseKeydownOptions) {
  useEffect(() => {
    const handleExit = (ev: KeyboardEvent) => {
      if (keys.includes(ev.key)) {
        onKeydown(ev);
      }
    };

    window.addEventListener("keydown", handleExit);
    return () => {
      window.addEventListener("keydown", handleExit);
    };
  }, [keys, onKeydown]);
}
