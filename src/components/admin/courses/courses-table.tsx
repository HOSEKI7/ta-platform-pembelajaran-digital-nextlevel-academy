"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, Pencil, Trash2, UsersRound } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminCourseRow } from "@/lib/admin-courses-query";

import { CourseStatusBadge } from "./course-status-badge";

type Props = {
  courses: AdminCourseRow[];
  isFetching: boolean;
  onDelete: (course: AdminCourseRow) => void;
};

const WIB_TZ = "Asia/Jakarta";

/** DD/MM/YYYY in WIB, or an em-dash for never-published rows. */
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

/** Stagger delay so rows cascade in on load (CSS-only via tw-animate-css). */
function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

/** Thumbnail + title + slug cell, shared between desktop table and mobile card. */
function CourseCell({ course }: { course: AdminCourseRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative aspect-[16/9] w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-[color:var(--color-surface-border)]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        ) : null}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
          {course.title}
        </p>
        <p className="truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          /{course.slug}
        </p>
      </div>
    </div>
  );
}

/** Edit (placeholder route) + Delete actions. */
function RowActions({
  course,
  onDelete,
}: {
  course: AdminCourseRow;
  onDelete: (course: AdminCourseRow) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/courses/${course.id}/edit`}
        aria-label={`Edit ${course.title}`}
        className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] hover:ring-[color:var(--color-brand-200)] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-brand-500)]/10 dark:hover:text-[color:var(--color-brand-200)]"
      >
        <Pencil className="size-4" strokeWidth={2.2} />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(course)}
        aria-label={`Hapus ${course.title}`}
        className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:hover:ring-red-500/30"
      >
        <Trash2 className="size-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function CoursesTable({ courses, isFetching, onDelete }: Props) {
  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && "pointer-events-none opacity-60",
      )}
    >
      {/* Desktop: semantic table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={cn(TH, "w-12 text-center")}>#</th>
              <th className={TH}>Kursus</th>
              <th className={TH}>Kategori</th>
              <th className={TH}>Instruktur</th>
              <th className={cn(TH, "text-right")}>Harga</th>
              <th className={cn(TH, "text-center")}>Peserta</th>
              <th className={TH}>Dibuat</th>
              <th className={TH}>Dipublish</th>
              <th className={TH}>Status</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr
                key={c.id}
                style={{ animationDelay: rowDelay(i) }}
                className={cn(
                  "border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80",
                  "dark:border-white/[0.04] dark:hover:bg-white/[0.03]",
                  "fade-in-0 slide-in-from-bottom-1 fill-mode-both animate-in duration-500",
                )}
              >
                <td className="px-4 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <CourseCell course={c} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                    {c.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {c.instructor}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {idr.format(c.price)}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                  {c.enrollmentCount}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtDate(c.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtDate(c.publishedAt)}
                </td>
                <td className="px-4 py-3">
                  <CourseStatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <RowActions course={c} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: stacked cards */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {courses.map((c, i) => (
          <li
            key={c.id}
            style={{ animationDelay: rowDelay(i) }}
            className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-3 px-4 py-4 duration-500"
          >
            <div className="flex items-start justify-between gap-3">
              <CourseCell course={c} />
              <CourseStatusBadge status={c.status} className="shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-[4.75rem] text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                {c.category.name}
              </span>
              <span>{c.instructor}</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {idr.format(c.price)}
              </span>
              <span className="inline-flex items-center gap-1">
                <UsersRound className="size-3.5" /> {c.enrollmentCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarPlus className="size-3.5" /> {fmtDate(c.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-end pl-[4.75rem]">
              <RowActions course={c} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
