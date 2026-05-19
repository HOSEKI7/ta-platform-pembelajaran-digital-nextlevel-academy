"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Play, ShoppingBag, Sparkles, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { idr, courseDurationText } from "@/lib/format";
import { cn } from "@/lib/utils";

import { CatalogOwnedRibbon, CatalogOwnedSrLabel } from "./catalog-owned-ribbon";

/**
 * Normalized data shape the preview dialog consumes. Both the catalog card
 * (`StudentCatalogCourse`) and the dashboard recommendation card
 * (`RecommendedCourseDTO`) adapt their DTO into this shape before passing it
 * in — keeps the dialog independent of either DTO's exact field set, and
 * makes `isOwned` explicit (recommendations are always `false`).
 */
export type CoursePreviewData = {
  title: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string | null;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { name: string };
  isOwned: boolean;
};

type Props = {
  course: CoursePreviewData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Course preview popup — opens when a student clicks a course card in
 * `/catalog` or in the "Rekomendasi Untukmu" section on `/dashboard`. Acts
 * as a quick-glance card before the user commits to navigating to the
 * landing detail page or starting checkout.
 *
 * - Unowned variant: shows discount chip + "Checkout" primary CTA (currently
 *   a no-op toast — payment flow is not yet implemented).
 * - Owned variant: shows "Dimiliki" diagonal ribbon + "Lanjut Belajar"
 *   primary CTA that routes to the learning view.
 *
 * Visual language mirrors `CatalogCourseCard` (rounded-3xl, brand palette,
 * Poppins headings, three-tier surface tokens for dark mode) so the popup
 * feels like an expanded version of the card the user just clicked.
 */
export function CoursePreviewDialog({ course, open, onOpenChange }: Props) {
  const { isOwned, fakePrice, price } = course;
  const hasDiscount = !isOwned && fakePrice != null && fakePrice > price;
  const discountPct = hasDiscount
    ? Math.round(((fakePrice! - price) / fakePrice!) * 100)
    : 0;

  const handleCheckoutClick = () => {
    toast.info("Fitur checkout segera tersedia", {
      description: "Pembayaran masih dalam pengembangan — pantau pengumuman ya.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "grid w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[520px]",
          "rounded-3xl bg-white text-zinc-900",
          "ring-1 ring-zinc-200 shadow-[0_40px_80px_-30px_rgba(35,65,137,0.45)]",
          "transform-gpu will-change-transform",
          "dark:bg-[color:var(--color-surface-card)] dark:text-zinc-50",
          "dark:ring-[color:var(--color-surface-border)] dark:shadow-[0_40px_80px_-28px_rgba(0,0,0,0.7)]",
        )}
      >
        {/* Hero thumbnail */}
        <div className="relative block aspect-[16/10] w-full overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, 520px"
            className="object-cover"
            priority
            unoptimized
          />

          {/* Top-left category pill (matches card pattern) */}
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[color:var(--color-brand-800)] ring-1 ring-white/60 dark:bg-[color:var(--color-surface-card-strong)] dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-surface-border)]">
            <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)]" />
            {course.category.name}
          </span>

          {/* Top-right: ribbon when owned, discount chip when unowned-with-discount */}
          {isOwned ? (
            <CatalogOwnedRibbon />
          ) : hasDiscount ? (
            <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-accent)] px-2.5 py-1 text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.8)]">
              <Sparkles className="size-3" strokeWidth={2.6} />
              −{discountPct}%
            </span>
          ) : null}

          {/* Custom close button — small, top-left to avoid colliding with the
              ribbon/discount chip. White pill so it stays legible over any
              thumbnail. */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Tutup pratinjau kursus"
            className={cn(
              "absolute left-4 top-14 z-30 inline-flex size-8 items-center justify-center rounded-full transition",
              "bg-white text-zinc-700 shadow-[0_6px_18px_-6px_rgba(15,15,30,0.4)] ring-1 ring-zinc-200",
              "hover:bg-zinc-50 hover:text-zinc-900",
              "dark:bg-[color:var(--color-surface-card-strong)] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-500)]",
            )}
          >
            <XIcon className="size-4" strokeWidth={2.4} />
          </button>

          {/* Gradient veil at bottom for legibility */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6 sm:p-7">
          <div className="flex flex-col gap-2.5">
            <h2 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
              {course.title}
              {isOwned ? <CatalogOwnedSrLabel /> : null}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-300/70">
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
          </div>

          {course.shortDescription ? (
            <p className="line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/85">
              {course.shortDescription}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-400 italic dark:text-zinc-500">
              Belum ada ringkasan untuk kursus ini.
            </p>
          )}

          {/* Price + CTA — bordered footer area for visual rhythm */}
          <div className="mt-2 flex flex-col gap-5 border-t border-zinc-200 pt-5 dark:border-[color:var(--color-surface-border)]">
            <PriceBlock
              isOwned={isOwned}
              price={price}
              fakePrice={fakePrice}
              hasDiscount={hasDiscount}
              discountPct={discountPct}
            />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href={`/courses/${course.slug}`}
                className={cn(
                  "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-bold transition",
                  "border border-zinc-300 bg-white text-zinc-900 hover:border-[color:var(--color-brand-400)] hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-900)]",
                  "dark:border-[color:var(--color-surface-border)] dark:bg-transparent dark:text-zinc-100 dark:hover:border-[color:var(--color-brand-400)]/60 dark:hover:bg-[color:var(--color-brand-500)]/10 dark:hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[color:var(--color-surface-card)]",
                )}
              >
                Jelajahi Kursus
                <ArrowUpRight className="size-4" strokeWidth={2.4} />
              </Link>

              {isOwned ? (
                <Link
                  href={`/learn/${course.slug}`}
                  className={cn(
                    "group inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-bold text-white transition",
                    "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(71,142,244,0.7)] hover:bg-[color:var(--color-brand-600)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[color:var(--color-surface-card)]",
                  )}
                >
                  <Play className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.6} fill="currentColor" />
                  Lanjut Belajar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className={cn(
                    "group inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-bold text-white transition",
                    "bg-[color:var(--color-brand-500)] shadow-[0_12px_26px_-12px_rgba(71,142,244,0.7)] hover:bg-[color:var(--color-brand-600)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[color:var(--color-surface-card)]",
                  )}
                >
                  <ShoppingBag className="size-4 transition group-hover:-translate-y-0.5" strokeWidth={2.4} />
                  Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PriceBlockProps = {
  isOwned: boolean;
  price: number;
  fakePrice: number | null;
  hasDiscount: boolean;
  discountPct: number;
};

function PriceBlock({ isOwned, price, fakePrice, hasDiscount, discountPct }: PriceBlockProps) {
  if (isOwned) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Telah dibeli
          </div>
          <div className="mt-1 font-heading text-2xl font-extrabold text-zinc-400 line-through decoration-zinc-400/70 decoration-[1.5px] dark:text-zinc-500 dark:decoration-zinc-500/60">
            {idr.format(price)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success)]/12 px-3 py-1 text-[11px] font-bold text-[color:var(--color-success)] ring-1 ring-[color:var(--color-success)]/30">
          <Sparkles className="size-3" strokeWidth={2.6} />
          Akses penuh
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {hasDiscount ? (
          <div className="text-[13px] text-zinc-400 line-through dark:text-zinc-500">
            {idr.format(fakePrice!)}
          </div>
        ) : null}
        <div className="font-heading text-3xl font-extrabold leading-none text-zinc-900 dark:text-zinc-50">
          {idr.format(price)}
        </div>
      </div>
      {hasDiscount ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-accent)] px-3 py-1 text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.7)]">
          Hemat {discountPct}%
        </span>
      ) : null}
    </div>
  );
}
