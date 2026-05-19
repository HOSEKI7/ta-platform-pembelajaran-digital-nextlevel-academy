import Image from "next/image";
import { BadgeCheck, Clock, Infinity as InfinityIcon } from "lucide-react";

import { courseDurationText } from "@/lib/format";
import type { CheckoutCourse } from "@/lib/checkout-data-loader";

type Props = {
  course: CheckoutCourse;
};

export function OrderSummaryCard({ course }: Props) {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_20px_50px_-30px_rgba(35,65,137,0.18)] sm:p-7"
    >
      <header className="flex items-center justify-between gap-3">
        <h2
          id="order-summary-heading"
          className="font-heading text-lg font-extrabold tracking-tight text-zinc-900"
        >
          Ringkasan Pesanan
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          1 kursus
        </span>
      </header>

      <div className="mt-5 flex gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-zinc-200 sm:size-28">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="112px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-brand-800)]">
            <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
            {course.category.name}
          </span>
          <h3 className="mt-2 line-clamp-2 font-heading text-base font-bold leading-snug text-zinc-900">
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">oleh {course.instructor}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="size-3.5" />
            {courseDurationText(course.estimatedDuration)}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2.5 border-t border-zinc-200 pt-5 text-xs text-zinc-600 sm:grid-cols-2">
        <li className="inline-flex items-center gap-2">
          <InfinityIcon className="size-4 text-[color:var(--color-brand-600)]" />
          Akses seumur hidup
        </li>
        <li className="inline-flex items-center gap-2">
          <BadgeCheck className="size-4 text-[color:var(--color-brand-600)]" />
          Sertifikat setelah selesai
        </li>
      </ul>
    </section>
  );
}
