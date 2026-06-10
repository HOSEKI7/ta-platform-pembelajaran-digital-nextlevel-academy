"use client";

import { useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatLongID,
  isoToLocalDate,
  localDateToISO,
} from "@/components/mentor/student-attendance/attendance-format";

type Props = {
  /** Selected date "yyyy-MM-dd" ("" when none chosen yet). */
  dateISO: string;
  /** Selected time "HH:mm" ("" when none). */
  time: string;
  /** Inclusive selectable bounds "yyyy-MM-dd". */
  minISO: string;
  maxISO: string;
  onDateChange: (dateISO: string) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
};

/** Tenggat (tanggal + jam, WIB) picker — Calendar popover + native time input. */
export function DeadlinePicker({
  dateISO,
  time,
  minISO,
  maxISO,
  onDateChange,
  onTimeChange,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold transition sm:flex-1",
            "hover:border-[color:var(--color-brand-300)] focus-visible:border-[color:var(--color-brand-500)] focus-visible:outline-none disabled:opacity-60",
            "dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]",
            dateISO ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          <CalendarDays
            className="size-4 shrink-0 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]"
            strokeWidth={2.2}
          />
          {dateISO ? formatLongID(dateISO) : "Pilih tanggal"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateISO ? isoToLocalDate(dateISO) : undefined}
            defaultMonth={isoToLocalDate(dateISO || minISO)}
            onSelect={(date) => {
              if (!date) return;
              onDateChange(localDateToISO(date));
              setOpen(false);
            }}
            disabled={{ before: isoToLocalDate(minISO), after: isoToLocalDate(maxISO) }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <div className="relative sm:w-40">
        <Clock
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          strokeWidth={2.2}
        />
        <input
          type="time"
          value={time}
          disabled={disabled}
          onChange={(e) => onTimeChange(e.target.value)}
          aria-label="Jam tenggat"
          className={cn(
            "h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm font-semibold text-zinc-900 transition tabular-nums",
            "hover:border-[color:var(--color-brand-300)] focus-visible:border-[color:var(--color-brand-500)] focus-visible:outline-none disabled:opacity-60",
            "dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-100",
          )}
        />
      </div>
    </div>
  );
}
