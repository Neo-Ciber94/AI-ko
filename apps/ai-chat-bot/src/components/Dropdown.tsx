"use client";

import { useMediaQuery } from "@/client/hooks/use-media-query";
import { breakpoints } from "@/lib/common/constants";
import React, { useEffect, useMemo, useState } from "react";

interface DropdownProps {
  children: React.ReactNode;
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function Dropdown({
  children,
  open,
  anchor,
  onClose,
}: DropdownProps) {
  const [dropdown, setDropdown] = useState<HTMLUListElement | null>(null);
  const isSmallScreen = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const pos = useMemo(() => {
    if (anchor == null || dropdown == null) {
      return { top: 0, left: 0 };
    }

    const rect = anchor.getBoundingClientRect();
    const dropdownWidth = dropdown.getBoundingClientRect().width;
    const left = Math.min(rect.left, window.innerWidth - dropdownWidth);
    return { top: rect.top, left };
  }, [anchor, dropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdown && !dropdown.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown, onClose]);

  useEffect(() => {
    const handleExit = (ev: KeyboardEvent) => {
      if (ev.key === "Esc") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleExit);
    return () => {
      window.addEventListener("keydown", handleExit);
    };
  }, [onClose]);

  return (
    <>
      {open && (
        <>
          {isSmallScreen && (
            <div className="fixed left-0 top-0 z-10 h-full w-screen bg-black/70 backdrop-blur-sm"></div>
          )}
          <div
            className="fixed z-10"
            style={
              isSmallScreen
                ? {
                    left: "50%",
                    top: "30%",
                    transform: "translateX(-50%)",
                  }
                : {
                    top: pos.top + 20,
                    left: pos.left,
                  }
            }
          >
            <ul
              ref={(e) => {
                setDropdown(e);
              }}
              className="flex w-[90vw] flex-col rounded-md border border-gray-100/50 bg-black text-white shadow-md sm:w-full sm:min-w-[200px]"
            >
              {children}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

interface DropdownItemProps {
  title?: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}

Dropdown.Item = function DropdownItem({
  children,
  onClick,
  title,
}: DropdownItemProps) {
  return (
    <li
      title={title}
      className="w-full cursor-pointer px-4 py-4 hover:bg-gray-500/20 sm:py-2"
      onClick={onClick}
    >
      {children}
    </li>
  );
};