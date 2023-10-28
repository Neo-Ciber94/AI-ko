"use client";
import { useState, useEffect, useRef, useMemo } from "react";

type TypeWriterProps = {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
  startCompleted?: boolean;
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function TypeWriter({
  text,
  className,
  onDone,
  speed = 1000,
  startCompleted = false,
}: TypeWriterProps) {
  const isWritingRef = useRef(false);
  const isCompletedRef = useRef(startCompleted);
  const [chars, setChars] = useState(() => (startCompleted ? text : ""));
  const typeDelay = useMemo(() => (100 / speed) * 1000, [speed]);
  const [prevText, setPrevText] = useState<string | undefined>(() =>
    startCompleted ? text : undefined,
  );

  useEffect(() => {
    if (prevText !== text && !isWritingRef.current) {
      setPrevText(text);
      isCompletedRef.current = false;
    }

    if (isWritingRef.current || isCompletedRef.current) {
      return;
    }

    isWritingRef.current = true;
    isCompletedRef.current = false;
    setChars("");

    const write = async () => {
      for (const c of text) {
        await delay(typeDelay);
        setChars((prev) => prev + c);
      }
    };

    write()
      .then(() => {
        isCompletedRef.current = true;
        isWritingRef.current = false;
        if (onDone) {
          onDone();
        }
      })
      .catch(console.error);
  }, [onDone, prevText, text, typeDelay]);

  return <span className={className}>{chars}</span>;
}
