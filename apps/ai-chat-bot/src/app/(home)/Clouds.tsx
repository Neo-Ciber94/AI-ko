"use client";
import { useState, useEffect, useRef, ReactNode } from "react";

export default function Clouds() {
  return (
    <div className="absolute -z-20 h-full w-full opacity-30">
      <MouseFollower speed={0.05} className="h-full w-full max-w-xl">
        <div className="animate-cloud h-[100px] w-[100px] rounded-full blur-3xl sm:h-[200px] sm:w-[200px] "></div>
      </MouseFollower>
    </div>
  );
}

type Position = { x: number; y: number };

interface MouseFollowerProps {
  children: ReactNode;
  speed: number;
  className?: string;
  offset?: {
    x?: number;
    y?: number;
  };
}

const MouseFollower: React.FC<MouseFollowerProps> = ({
  speed,
  className,
  offset,
  children,
}) => {
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef<Position>(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const checkPosition = (ev: MouseEvent) => {
      mousePosRef.current = { x: ev.pageX, y: ev.pageY };
    };

    window.addEventListener("mousemove", checkPosition);
    return () => {
      window.removeEventListener("mousemove", checkPosition);
    };
  }, []);

  useEffect(() => {
    let requestAnimationId: number | undefined = undefined;
    const update = () => {
      const { current: position } = positionRef;
      const mousePos = mousePosRef.current;
      const dx = mousePos.x - position.x;
      const dy = mousePos.y - position.y;
      const offsetX = offset?.x ?? 0;
      const offsetY = offset?.y ?? 0;
      const newX = position.x + offsetX + dx * speed;
      const newY = position.y + offsetY + dy * speed;

      setPosition({
        x: newX,
        y: newY,
      });
      requestAnimationId = requestAnimationFrame(update);
    };

    update();
    return () => {
      if (requestAnimationId) {
        cancelAnimationFrame(requestAnimationId);
      }
    };
  }, [offset?.x, offset?.y, speed]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: position.y, left: position.x }}>
        {children}
      </div>
    </div>
  );
};
