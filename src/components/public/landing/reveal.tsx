"use client";

import { type CSSProperties, type ElementType, type ReactNode } from "react";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type RevealFrom = "up" | "left" | "right" | "scale";

type RevealProps = {
  children?: ReactNode;
  /** Entry direction. `up` (default) = fade + slide-up. */
  from?: RevealFrom;
  /** Stagger delay in ms (sets the `--reveal-delay` CSS var). */
  delay?: number;
  /** Element to render as. Defaults to `div`. Use e.g. `"article"`, `"li"`,
   *  `"figure"` so `<Reveal>` *becomes* the element (no extra wrapper). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/**
 * Reusable scroll-reveal wrapper. Drop it around (or render as) any below-fold
 * block to get a GPU-only fade-in + slide-up the first time it enters the
 * viewport (one-shot). The animation lives in `globals.css`
 * (`.reveal-ready [data-reveal]`), driven by {@link useScrollReveal}. Honors
 * `prefers-reduced-motion`.
 *
 * Renders a single element (`as`), so it stays hydration-safe across the
 * Server/Client boundary — no `cloneElement`/asChild. Never wrap the hero H1
 * (LCP); keep that instant.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const ref = useScrollReveal<HTMLElement>();

  const revealStyle: CSSProperties = {
    ...style,
    ...(delay > 0 ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : {}),
  };

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-from={from === "up" ? undefined : from}
      className={className}
      style={revealStyle}
    >
      {children}
    </Tag>
  );
}
