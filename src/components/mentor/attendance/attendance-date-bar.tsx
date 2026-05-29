"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDaysISO,
  formatLongID,
  isoToLocalDate,
  localDateToISO,
} from "@/components/mentor/attendance/attendance-format";

type Props = {
  /** Currently selected date "yyyy-MM-dd". */
  value: string;
  /** Inclusive navigable bounds "yyyy-MM-dd". */
  minISO: string;
  maxISO: string;
  /** Today "yyyy-MM-dd" (WIB) — enables/labels the "Hari ini" shortcut. */
  todayISO: string;
  onChange: (dateISO: string) => void;
  isFetching?: boolean;
};

export function AttendanceDateBar({
  value,
  minISO,
  maxISO,
  todayISO,
  onChange,
  isFetching,
}: Props) {
  const [open, setOpen] = useState(false);

  const prevISO = addDaysISO(value, -1);
  const nextISO = addDaysISO(value, 1);
  const canPrev = prevISO >= minISO;
  const canNext = nextISO <= maxISO;
  const isToday = value === todayISO;

  const minDate = isoToLocalDate(minISO);
  const maxDate = isoToLocalDate(maxISO);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-2xl bg-white p-1 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl"
          aria-label="Hari sebelumnya"
          disabled={!canPrev}
          onClick={() => onChange(prevISO)}
        >
          <ChevronLeft className="size-4" strokeWidth={2.4} />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            aria-label="Pilih tanggal"
            className={cn(
              "inline-flex h-9 min-w-[12.5rem] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold tabular-nums text-zinc-700 transition",
              "hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10",
              isFetching && "opacity-70",
            )}
          >
            <CalendarDays
              className="size-4 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]"
              strokeWidth={2.2}
            />
            {formatLongID(value)}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={isoToLocalDate(value)}
              defaultMonth={isoToLocalDate(value)}
              onSelect={(date) => {
                if (!date) return;
                onChange(localDateToISO(date));
                setOpen(false);
              }}
              disabled={{ before: minDate, after: maxDate }}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl"
          aria-label="Hari berikutnya"
          disabled={!canNext}
          onClick={() => onChange(nextISO)}
        >
          <ChevronRight className="size-4" strokeWidth={2.4} />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-2xl font-semibold"
        disabled={isToday}
        onClick={() => onChange(todayISO)}
      >
        Hari ini
      </Button>
    </div>
  );
}
