"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Infinity as InfinityIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CERT_EXPIRY_MAX_YEARS } from "@/lib/validations/admin-certificate";
import { useUpdateCertExpiryMutation } from "@/hooks/use-admin-certificate-settings";

type Props = {
  /** Current setting from the server. null = no expiry. */
  initialYears: number | null;
};

/** Parses the text field to a setting value, or `false` when invalid. */
function parseYears(input: string): number | null | false {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1 || n > CERT_EXPIRY_MAX_YEARS) return false;
  return n;
}

function describe(years: number | null): string {
  return years == null ? "Tanpa kedaluwarsa" : `${years} tahun sejak diterbitkan`;
}

/**
 * Global certificate-expiry configuration (PRD §6.11.7). The single write
 * action on an otherwise read-only surface. Changes are NON-RETROACTIVE — they
 * only affect certificates issued afterward. Saving is gated behind a
 * confirmation dialog (CLAUDE.md: confirm crucial updates).
 */
export function CertificateExpiryCard({ initialYears }: Props) {
  const [value, setValue] = useState(
    initialYears == null ? "" : String(initialYears),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useUpdateCertExpiryMutation();

  const parsed = parseYears(value);
  const isInvalid = parsed === false;
  const nextYears = parsed === false ? null : parsed;
  const isDirty = (initialYears ?? null) !== (nextYears ?? null);

  function handleConfirm() {
    if (isInvalid) return;
    mutation.mutate(
      { years: nextYears },
      {
        onSuccess: () => {
          toast.success(
            nextYears == null
              ? "Sertifikat baru kini berlaku tanpa kedaluwarsa."
              : `Sertifikat baru kini berlaku ${nextYears} tahun.`,
          );
          setConfirmOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Gagal menyimpan pengaturan sertifikat.",
          );
        },
      },
    );
  }

  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <CalendarClock className="size-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pengaturan Sertifikat
            </h2>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Masa berlaku global sertifikat. Kosongkan untuk tanpa kedaluwarsa.
              Perubahan hanya berlaku untuk sertifikat yang{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                diterbitkan setelahnya
              </span>{" "}
              — sertifikat lama tidak berubah.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {initialYears == null ? (
                <InfinityIcon className="size-3.5" strokeWidth={2.4} />
              ) : null}
              Saat ini: {describe(initialYears)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cert-expiry-years"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500"
            >
              Masa berlaku (tahun)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="cert-expiry-years"
                type="number"
                inputMode="numeric"
                min={1}
                max={CERT_EXPIRY_MAX_YEARS}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Tanpa kedaluwarsa"
                className={cn(
                  "h-10 w-44 rounded-full",
                  isInvalid &&
                    "ring-1 ring-rose-400 focus-visible:ring-rose-400",
                )}
                aria-invalid={isInvalid}
                aria-describedby={isInvalid ? "cert-expiry-error" : undefined}
              />
            </div>
            {isInvalid ? (
              <p id="cert-expiry-error" className="text-[11px] text-rose-500">
                Masukkan bilangan bulat 1–{CERT_EXPIRY_MAX_YEARS}, atau kosongkan.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            disabled={!isDirty || isInvalid || mutation.isPending}
            onClick={() => setConfirmOpen(true)}
            className="h-10 rounded-full"
          >
            Simpan
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="grid size-10 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <CalendarClock className="size-5" strokeWidth={2.2} />
            </span>
            <DialogTitle>Simpan masa berlaku sertifikat?</DialogTitle>
            <DialogDescription>
              Masa berlaku akan diubah dari{" "}
              <span className="font-semibold text-foreground">
                {describe(initialYears)}
              </span>{" "}
              menjadi{" "}
              <span className="font-semibold text-foreground">
                {describe(nextYears)}
              </span>
              . Hanya memengaruhi sertifikat yang diterbitkan setelah ini —
              sertifikat yang sudah terbit tidak terpengaruh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={handleConfirm}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : null}
              {mutation.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
