"use client";

import { type ChatError } from "@/client/hooks/use-chat";
import { useClickOutside } from "@/client/hooks/use-click-outside";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useMemo, useRef, useState } from "react";

export default function ChatErrorTooltip({ error }: { error: ChatError }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  useClickOutside({
    target: ref,
    onClick() {
      setIsOpen(false);
    },
  });

  return (
    <div
      className="relative"
      ref={(e) => {
        ref.current = e;
        setAnchor(e);
      }}
    >
      <button onClick={() => setIsOpen(true)}>
        <div className="flex flex-row items-center gap-1 rounded-lg bg-red-800/20 p-2 text-xs text-red-500">
          <ExclamationCircleIcon className="h-3 w-3" />
          <span>Error</span>
        </div>
      </button>

      {isOpen && <Tooltip content={error.message} anchor={anchor} />}
    </div>
  );
}

function Tooltip({
  content,
  anchor,
}: {
  content: string;
  anchor: HTMLElement | null;
}) {
  const [self, setSelf] = useState<HTMLDivElement | null>(null);
  const pos = useMemo(() => {
    if (anchor == null) {
      return { top: 0, left: 0 };
    }
    const rect = anchor.getBoundingClientRect();
    const top = rect.top + rect.height + 10;
    const width = self?.getBoundingClientRect().width ?? 0;
    const left = Math.min(rect.left, window.innerWidth - width - 10);
    return { top, left };
  }, [anchor, self]);

  return (
    <div
      ref={(e) => setSelf(e)}
      className="fixed min-w-[200px] rounded-md border border-red-500 bg-black p-4 text-xs text-red-400 sm:text-sm"
      style={{
        top: pos.top,
        left: pos.left,
      }}
    >
      <p className="flex items-center gap-1">
        <span>
          <ExclamationCircleIcon className="h-5 w-5" />
        </span>
        <span>{content}</span>
      </p>
    </div>
  );
}
