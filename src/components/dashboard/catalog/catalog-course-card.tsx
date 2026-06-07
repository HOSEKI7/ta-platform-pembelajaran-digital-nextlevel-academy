"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";

import type { StudentCatalogCourse } from "@/lib/student-catalog-query";
import { idr, courseDurationText } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  CatalogOwnedRibbon,
  CatalogOwnedSrLabel,
} from "./catalog-owned-ribbon";
import { CoursePreviewDialog } from "./course-preview-dialog";

type Props = {
  course: StudentCatalogCourse;
  className?: string;
};

/**
 * Course card for the student-area catalog. Visually mirrors the public
 * landing card so the surfaces feel consistent, with two adjustments:
 *  1. Owned cards get a diagonal "Dimiliki" ribbon in the top-right corner
 *     and a muted/struck price block (no `fakePrice` line, to avoid two
 *     strikethroughs stacking).
 *  2. The card is dark-mode aware — it lives inside the student shell which
 *     supports both themes.
 *
 * Click behavior: the entire card surface is a button that opens a
 * `CoursePreviewDialog` overlay (quick-preview of the course with CTAs for
 * "Jelajahi Kursus" and "Checkout" / "Lanjut Belajar"). A transparent
 * absolute button covers the card so the underlying `<article>` keeps its
 * semantic value for assistive tech and the focus ring outlines the card.
 */
export function CatalogCourseCard({ course, className }: Props) {
  const owned = course.isOwned;
  const hasDiscount =
    !owned && course.fakePrice != null && course.fakePrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.fakePrice! - course.price) / course.fakePrice!) * 100)
    : 0;

  // Lazy-mount the preview dialog: only mount after the first click. Avoids
  // setting up N Dialog instances (Floating UI primitives, event listeners,
  // ARIA wiring) for every card in the grid, which made opening visibly laggy
  // — especially on the 9-card catalog page. Once mounted, base-ui keeps the
  // dialog alive for subsequent open/close cycles.
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = () => {
    setHasOpened(true);
    setOpen(true);
  };

  return (
    <article
      aria-label={course.title}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80 transition",
        "hover:-translate-y-1 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_30px_50px_-30px_rgba(35,65,137,0.4)]",
        "focus-within:ring-2 focus-within:ring-[color:var(--color-brand-400)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60 dark:hover:shadow-[0_30px_50px_-28px_rgba(71,142,244,0.45)]",
        className,
      )}
    >
      {/* Transparent click overlay — keeps <article> semantics intact while
          giving the entire card a single keyboard-accessible trigger. Sits
          above the ribbon (z-20) and category pill (z-10) so clicks anywhere
          on the surface fire onOpen. */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Lihat ringkasan kursus ${course.title}`}
        className="absolute inset-0 z-30 cursor-pointer rounded-3xl bg-transparent focus:outline-none"
      />

      <div className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized
        />

        {/* Top-left category pill */}
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-brand-800)] ring-1 ring-white/60 backdrop-blur dark:bg-[color:var(--color-surface-card-strong)]/95 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-surface-border)]">
          <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
          {course.category.name}
        </span>

        {/* Top-right: discount badge (unowned only) OR owned ribbon */}
        {owned ? (
          <CatalogOwnedRibbon />
        ) : hasDiscount ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-accent)] px-2.5 py-1 text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.8)]">
            <Sparkles className="size-3" strokeWidth={2.6} /> −{discountPct}%
          </span>
        ) : null}

        {/* Gradient veil at bottom for readability */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {course.title}
          {owned ? <CatalogOwnedSrLabel /> : null}
        </h3>

        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-300/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[10px] font-bold text-[color:var(--color-brand-800)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
              {course.instructor[0]?.toUpperCase() ?? "N"}
            </span>
            {course.instructor}
          </span>
          <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {courseDurationText(course.estimatedDuration)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {owned ? (
              <div className="font-heading text-xl font-extrabold text-zinc-400 line-through decoration-zinc-400/70 decoration-[1.5px] dark:text-zinc-500 dark:decoration-zinc-500/60">
                {idr.format(course.price)}
              </div>
            ) : (
              <>
                {hasDiscount ? (
                  <div className="text-[12px] text-zinc-400 line-through dark:text-zinc-500">
                    {idr.format(course.fakePrice!)}
                  </div>
                ) : null}
                <div className="font-heading text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {idr.format(course.price)}
                </div>
              </>
            )}
          </div>
          <span
            aria-hidden
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full transition",
              "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-800)]",
              "group-hover:bg-[color:var(--color-brand-500)] group-hover:text-white",
              "dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]",
              "dark:group-hover:bg-[color:var(--color-brand-500)] dark:group-hover:text-white",
            )}
          >
            <ArrowUpRight className="size-4" strokeWidth={2.4} />
          </span>
        </div>
      </div>

      {hasOpened ? (
        <CoursePreviewDialog
          course={course}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </article>
  );
}
