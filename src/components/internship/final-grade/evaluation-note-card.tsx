"use client";

import { useState } from "react";
import { CalendarClock, Maximize2, MessageSquareQuote, ShieldAlert, UserCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatGradeDateTime } from "@/components/internship/final-grade/final-grade-helpers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NoteAuthor } from "@/lib/internship-final-grade-types";

type Props = {
  note: string;
  author: NoteAuthor;
  updatedAtISO: string | null;
};

const TRUNCATE_LIMIT = 180;

export function EvaluationNoteCard({ note, author, updatedAtISO }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isLongText = note.length > TRUNCATE_LIMIT;
  const displayText = isLongText ? `${note.slice(0, TRUNCATE_LIMIT)}…` : note;
  const formattedDate = updatedAtISO ? formatGradeDateTime(updatedAtISO) : null;

  const isAdmin = author.roleLabel === "Admin";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Header: Icon + Title + Author Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/30">
              <MessageSquareQuote className="size-4.5" strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Catatan Evaluasi Final
              </h3>
              {formattedDate ? (
                <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <CalendarClock className="size-3.5" strokeWidth={2} />
                  {formattedDate}
                </span>
              ) : null}
            </div>
          </div>

          {/* Author Badge (Mentor vs Admin) */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
              isAdmin
                ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
                : "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/30",
            )}
          >
            {isAdmin ? (
              <ShieldAlert className="size-3.5" strokeWidth={2.2} />
            ) : (
              <UserCheck className="size-3.5" strokeWidth={2.2} />
            )}
            <span>
              {author.roleLabel} · <span className="font-bold">{author.name}</span>
            </span>
          </div>
        </div>

        {/* Note Body */}
        <div className="relative rounded-2xl bg-zinc-50/80 p-4.5 dark:bg-white/[0.03]">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            &ldquo;{displayText}&rdquo;
          </p>

          {isLongText ? (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Maximize2 className="size-3.5" />
                Baca Catatan Lengkap
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Full Note Modal Dialog */}
      {isLongText ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareQuote className="size-5 text-[color:var(--color-brand-500)]" />
                Catatan Evaluasi Lengkap
              </DialogTitle>
              <DialogDescription>
                Catatan resmi dari{" "}
                <span className="font-semibold text-foreground">
                  {author.roleLabel} ({author.name})
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-zinc-50 p-4.5 dark:bg-white/[0.04]">
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                &ldquo;{note}&rdquo;
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  );
}
