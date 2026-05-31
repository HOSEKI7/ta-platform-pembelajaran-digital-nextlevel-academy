"use client";

import {
  Award,
  Crown,
  Flame,
  GraduationCap,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type BadgeIconKey,
  type BadgeTriggerKey,
  badgeVisual,
} from "@/lib/gamification-types";

const ICON_MAP: Record<BadgeIconKey, LucideIcon> = {
  sparkles: Sparkles,
  trophy: Trophy,
  flame: Flame,
  crown: Crown,
  award: Award,
  star: Star,
  rocket: Rocket,
  "graduation-cap": GraduationCap,
};

type Size = "sm" | "md" | "lg";

const BOX: Record<Size, string> = {
  sm: "size-12",
  md: "size-16",
  lg: "size-20",
};

const ICON_SIZE: Record<Size, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-9",
};

type Props = {
  logoUrl: string | null;
  trigger: BadgeTriggerKey;
  threshold: number;
  size?: Size;
  alt?: string;
  className?: string;
};

/**
 * Badge icon display (PRD §6.11.8). Renders the custom/preset image when
 * `logoUrl` is set, otherwise falls back to the text-based per-trigger medallion
 * (`badgeVisual` icon + gradient) used on the student `/exp-level` page.
 */
export function BadgeIcon({
  logoUrl,
  trigger,
  threshold,
  size = "md",
  alt,
  className,
}: Props) {
  if (logoUrl) {
    return (
      // Plain <img>: preset is same-origin SVG, uploads are signed Bunny URLs.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={alt ?? "Ikon badge"}
        className={cn(
          "rounded-2xl object-cover ring-1 ring-zinc-200 dark:ring-white/10",
          BOX[size],
          className,
        )}
      />
    );
  }

  const visual = badgeVisual({ trigger, threshold });
  const Icon = ICON_MAP[visual.iconKey];

  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
        visual.gradientFrom,
        visual.gradientTo,
        BOX[size],
        className,
      )}
    >
      <Icon className={ICON_SIZE[size]} strokeWidth={2.2} />
    </div>
  );
}
