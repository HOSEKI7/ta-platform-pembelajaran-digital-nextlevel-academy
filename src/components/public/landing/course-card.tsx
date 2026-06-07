import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { name: string };
};

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function durationText(min: number | null): string {
  if (!min) return "Akses seumur hidup";
  if (min < 60) return `${min} menit`;
  const h = Math.round(min / 60);
  return `${h} jam belajar`;
}

type Props = {
  course: CourseCardData;
  className?: string;
};

export function CourseCard({ course, className }: Props) {
  const hasDiscount = course.fakePrice && course.fakePrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.fakePrice! - course.price) / course.fakePrice!) * 100)
    : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80 transition",
        "hover:-translate-y-1 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_30px_50px_-30px_rgba(35,65,137,0.4)]",
        className,
      )}
    >
      <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized
        />

        {/* Top-left category pill */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-brand-800)] ring-1 ring-white/60 backdrop-blur">
          <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
          {course.category.name}
        </span>

        {/* Top-right discount badge */}
        {hasDiscount ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-accent)] px-2.5 py-1 text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.8)]">
            <Sparkles className="size-3" strokeWidth={2.6} /> −{discountPct}%
          </span>
        ) : null}

        {/* Gradient veil at bottom for readability */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/courses/${course.slug}`} className="group/title">
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-zinc-900 transition group-hover/title:text-[color:var(--color-brand-700)]">
            {course.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[10px] font-bold text-[color:var(--color-brand-800)]">
              {course.instructor[0]?.toUpperCase() ?? "N"}
            </span>
            {course.instructor}
          </span>
          <span className="size-1 rounded-full bg-zinc-300" />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {durationText(course.estimatedDuration)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {hasDiscount ? (
              <div className="text-[12px] text-zinc-400 line-through">
                {idr.format(course.fakePrice!)}
              </div>
            ) : null}
            <div className="font-heading text-xl font-extrabold text-zinc-900">
              {idr.format(course.price)}
            </div>
          </div>
          <Link
            href={`/courses/${course.slug}`}
            aria-label={`Lihat ${course.title}`}
            className="inline-flex size-10 items-center justify-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-800)] transition group-hover:bg-[color:var(--color-brand-500)] group-hover:text-white"
          >
            <ArrowUpRight className="size-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}
