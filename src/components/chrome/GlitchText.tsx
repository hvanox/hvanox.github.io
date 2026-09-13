"use client";

import { useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * RGB-сплит из трёх слоёв: bone держит читаемость, blood и cyan уезжают
 * в стороны. Глитч включается только по hover/focus либо через `always` —
 * самопроизвольных стробов нет (эпилепсия, DESIGN.md).
 */

type GlitchTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Глитчить постоянно, без наведения. */
  always?: boolean;
};

export function GlitchText({ text, as: Tag = "span", className, always = false }: GlitchTextProps) {
  const [active, setActive] = useState(false);
  const on = always || active;

  return (
    <Tag
      className={cn("relative inline-block text-bone text-outline", className)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {/* Базовый слой — единственный, который читает скринридер. */}
      <span className="relative z-10">{text}</span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none text-blood mix-blend-screen",
          on ? "glitch-layer -left-[2px]" : "absolute inset-0 opacity-0",
        )}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none text-cyan mix-blend-screen",
          on ? "glitch-layer left-[2px] [animation-delay:-1.2s]" : "absolute inset-0 opacity-0",
        )}
      >
        {text}
      </span>
    </Tag>
  );
}
