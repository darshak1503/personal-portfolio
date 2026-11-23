"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "framer-motion";
import { PageScrim } from "@/components/effects/page-scrim";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { ScrollProgressProvider } from "@/components/providers/scroll-progress-provider";

const GlobalWorldScene = dynamic(
  () => import("@/components/three/global-world-scene").then((m) => m.GlobalWorldScene),
  { ssr: false },
);

export function SiteShell({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      anchors: { offset: -24 },
    });

    return () => lenis.destroy();
  }, [reducedMotion]);

  useEffect(() => {
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = lastEvent;
      if (!event) return;
      const card = (event.target as Element | null)?.closest<HTMLElement>(".spot-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <ScrollProgressProvider>
      {reducedMotion ? <div className="world-fallback" aria-hidden /> : <GlobalWorldScene />}
      <PageScrim />
      <ScrollProgress />
      <div className="site-content">{children}</div>
    </ScrollProgressProvider>
  );
}
