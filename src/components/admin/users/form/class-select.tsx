"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassOption } from "@/lib/admin-users-query";

type Props = {
  value: string;
  onChange: (classId: string) => void;
  options: ClassOption[];
  disabled?: boolean;
  /** Show "x/max" intern quota next to each option (magang only). */
  showQuota?: boolean;
};

/** Controlled Class picker. Labels already encode Batch + Field + Class. */
export function ClassSelect({
  value,
  onChange,
  options,
  disabled,
  showQuota,
}: Props) {
  const selected = options.find((o) => o.id === value);

  if (options.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/[0.07] dark:text-amber-300">
        Belum ada kelas. Buat Batch, Bidang, dan Kelas terlebih dahulu.
      </p>
    );
  }

  return (
    <Select
      value={value || ""}
      onValueChange={(v) => {
        if (typeof v === "string") onChange(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-11 w-full rounded-xl" aria-label="Kelas">
        <SelectValue placeholder="Pilih kelas…">
          {() => selected?.label ?? "Pilih kelas…"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const full = o.studentCount >= o.maxStudents;
          return (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
              {showQuota ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({o.studentCount}/{o.maxStudents}
                  {full ? " · penuh" : ""})
                </span>
              ) : null}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
