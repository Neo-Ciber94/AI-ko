import { useEffect, useState } from "react";

export function useMediaQuery(media: string, defaultValue = false) {
  const [isMatching, setIsMatching] = useState(defaultValue);

  useEffect(() => {
    const mq = window.matchMedia(media);
    setIsMatching(mq.matches);

    const checkMedia = (ev: MediaQueryListEvent) => setIsMatching(ev.matches);
    mq.addEventListener("change", checkMedia);
    return () => {
      mq.removeEventListener("change", checkMedia);
    };
  }, [media]);

  return isMatching;
}
