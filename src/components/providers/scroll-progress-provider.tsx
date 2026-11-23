"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";

const ScrollProgressContext = createContext<RefObject<number>>({ current: 0 });

function readProgress() {
  const el = document.documentElement;
  const total = el.scrollHeight - el.clientHeight;
  return total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0;
}

/**
 * Tracks page scroll progress (0–1) in a ref and a `--scroll-progress` CSS variable.
 * Consumers read the ref inside animation loops, so scrolling never re-renders React.
 */
export function ScrollProgressProvider({ children }: { children: ReactNode }) {
  const progress = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      progress.current = readProgress();
      root.style.setProperty("--scroll-progress", progress.current.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <ScrollProgressContext.Provider value={progress}>{children}</ScrollProgressContext.Provider>
  );
}

export function useScrollProgressRef() {
  return useContext(ScrollProgressContext);
}
