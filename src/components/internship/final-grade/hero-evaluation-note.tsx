"use client";

import { useState } from "react";
import { Maximize2, MessageSquareQuote, ShieldAlert, UserCheck } from "lucide-react";

import { cn } from "@/lib/utils";
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
};

const TRUNCATE_LIMIT = 150;

export function HeroEvaluationNote({ note, author }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isLongText = note.length > TRUNCATE_LIMIT;
  const displayText = isLongText ? `${note.slice(0, TRUNCATE_LIMIT)}…` : note;
  const isAdmin = author.roleLabel === "Admin";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          "group/note relative mt-2 overflow-hidden rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer select-none",
          "border-zinc-200/90 bg-gradient-to-br from-zinc-50/90 via-white to-zinc-50/90 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-900/5",
          "dark:border-white/10 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-white/[0.04] dark:hover:border-white/20 dark:hover:shadow-black/20",
        )}
      >
        {/* Accent Bar indicator */}
        <div
          aria-hidden
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-colors",
            isAdmin
              ? "bg-amber-500 group-hover/note:bg-amber-600"
              : "bg-[color:var(--color-brand-500)] group-hover/note:bg-[color:var(--color-brand-600)]",
          )}
        />

        <div className="flex flex-col gap-2.5 pl-1.5">
          {/* Textbox Header: Icon + Title + Author Tag */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-6.5 place-items-center rounded-lg text-xs font-bold ring-1",
                  isAdmin
                    ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30"
                    : "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/20 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/30",
                )}
              >
                <MessageSquareQuote className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Catatan Evaluasi
              </span>
            </div>

            {/* Author Pill */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                isAdmin
                  ? "bg-amber-50 text-amber-800 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
                  : "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-800)] ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/30",
              )}
            >
              {isAdmin ? (
                <ShieldAlert className="size-3" strokeWidth={2.2} />
              ) : (
                <UserCheck className="size-3" strokeWidth={2.2} />
              )}
              <span>
                {author.roleLabel} · <span className="font-bold">{author.name}</span>
              </span>
            </span>
          </div>

          {/* Textbox Note Content Preview */}
          <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            &ldquo;{displayText}&rdquo;
          </p>

          {/* Action indicator */}
          <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-zinc-500 transition-colors group-hover/note:text-zinc-900 dark:text-zinc-400 dark:group-hover/note:text-zinc-200">
            <span>{isLongText ? "Lihat catatan lengkap" : "Buka catatan"}</span>
            <Maximize2 className="size-3 transition-transform group-hover/note:scale-110" />
          </div>
        </div>
      </div>

      {/* Dialog Modal for Full Note */}
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
    </>
  );
}
