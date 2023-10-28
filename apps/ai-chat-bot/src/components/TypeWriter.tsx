"use client";
import { useState, useEffect, useRef, useMemo } from "react";

type TypeWriterProps = {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function TypeWriter({
  text,
  className,
  onDone,
  speed = 1000,
}: TypeWriterProps) {
  const isWritingRef = useRef(false);
  const [chars, setChars] = useState("");
  const typeDelay = useMemo(() => (100 / speed) * 1000, [speed]);

  useEffect(() => {
    if (isWritingRef.current) {
      return;
    }

    isWritingRef.current = true;
    const run = async () => {
      for (const c of text) {
        await delay(typeDelay);
        setChars((prev) => prev + c);
      }
    };

    run().then(onDone).catch(console.error);
  }, [onDone, text, typeDelay]);

  return <span className={className}>{chars}</span>;
}
