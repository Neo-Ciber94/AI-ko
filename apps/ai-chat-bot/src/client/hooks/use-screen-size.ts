import { useEffect, useState } from "react";

type Size = {
  width: number;
  height: number;
};

export function useScreenSize(
  defaultSize: Size | (() => Size) = { width: 0, height: 0 },
) {
  const [size, setSize] = useState<Size>(defaultSize);

  useEffect(() => {
    const checkSize = () => {
      const height = window.screen.height;
      const width = window.screen.width;
      setSize({ width, height });
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => {
      window.removeEventListener("resize", checkSize);
    };
  }, []);

  return size;
}
