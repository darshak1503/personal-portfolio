"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function PageIntro() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  if (reducedMotion || !visible) return null;

  return <div className="page-intro" aria-hidden />;
}