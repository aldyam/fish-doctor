"use client";

import { useEffect, useState } from "react";

const SUBTITLE = "Deteksi penyakit ikan air tawar dengan teknologi artificial intelligence";
const CHARACTER_DELAY = 30;
const INITIAL_DELAY = 200;

export default function DiagnosisSubtitle() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number;
    let index = 0;

    const finish = () => {
      window.clearTimeout(timer);
      setVisibleCharacters(SUBTITLE.length);
    };
    const typeNext = () => {
      index += 1;
      setVisibleCharacters(index);
      if (index < SUBTITLE.length) {
        timer = window.setTimeout(typeNext, CHARACTER_DELAY);
      }
    };
    // Finish on preference changes without restarting the animation.
    const onMotionChange = () => finish();
    timer = window.setTimeout(
      reducedMotion.matches ? finish : typeNext,
      reducedMotion.matches ? 0 : INITIAL_DELAY,
    );
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      window.clearTimeout(timer);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <span className="relative block">
      <span className="sr-only">{SUBTITLE}</span>
      {/* Reserve the final wrapped text height, including before hydration. */}
      <span aria-hidden="true" className="invisible motion-reduce:visible">{SUBTITLE}</span>
      <span aria-hidden="true" className="absolute inset-0 motion-reduce:hidden">
        {SUBTITLE.slice(0, visibleCharacters)}
      </span>
    </span>
  );
}
