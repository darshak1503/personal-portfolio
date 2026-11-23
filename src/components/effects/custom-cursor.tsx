"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    document.body.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      dotRef.current?.style.setProperty("transform", `translate3d(${x}px, ${y}px, 0)`);
      ringRef.current?.style.setProperty(
        "transform",
        `translate3d(${x}px, ${y}px, 0) scale(1)`,
      );
    };

    window.addEventListener("mousemove", move);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}