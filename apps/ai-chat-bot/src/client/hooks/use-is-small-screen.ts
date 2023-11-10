import { useEffect, useState } from "react";

export function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsSmallScreen(mq.matches);

    const checkSize = (ev: MediaQueryListEvent) => {
      setIsSmallScreen(ev.matches);
    };

    mq.addEventListener("change", checkSize);
    return () => {
      mq.removeEventListener("change", checkSize);
    };
  }, []);

  return isSmallScreen;
}
