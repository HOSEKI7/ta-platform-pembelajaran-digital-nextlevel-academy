"use client";

import { useState } from "react";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { passwordComplexity } from "@/lib/validations/admin-user";

import { PasswordInput } from "./form/password-input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  saving: boolean;
  onConfirm: (tempPassword: string) => void;
};

/**
 * Two-step dialog: (1) admin enters a temporary password (complexity-checked),
 * (2) confirms the consequence — the Peserta Didik is forced to change it at
 * next login. Admin never holds the user's lasting password (PRD §6.11.4).
 */
export function SetTempPasswordDialog({
  open,
  onOpenChange,
  userName,
  saving,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (saving) return;
    if (!next) {
      setStep("input");
      setValue("");
      setError(null);
    }
    onOpenChange(next);
  }

  function handleNext() {
    const parsed = passwordComplexity.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Password tidak valid.");
      return;
    }
    setError(null);
    setStep("confirm");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            {step === "input" ? (
              <KeyRound className="size-5" strokeWidth={2.2} />
            ) : (
              <ShieldAlert className="size-5" strokeWidth={2.2} />
            )}
          </span>
          <DialogTitle>
            {step === "input"
              ? "Set Password Sementara"
              : "Konfirmasi password sementara"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" ? (
              <>
                Buat password sementara untuk{" "}
                <span className="font-semibold text-foreground">
                  “{userName}”
                </span>
                . Minimal 8 karakter dengan huruf besar, kecil, dan angka.
              </>
            ) : (
              <>
                Saat{" "}
                <span className="font-semibold text-foreground">
                  “{userName}”
                </span>{" "}
                login dengan password ini, sistem akan{" "}
                <span className="font-semibold text-foreground">
                  memaksanya mengganti password
                </span>{" "}
                sebelum bisa mengakses halaman apa pun. Sesi aktif yang ada akan
                dicabut. Lanjutkan?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <div className="flex flex-col gap-2">
            <PasswordInput
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Password sementara"
              maxLength={64}
              autoComplete="new-password"
              aria-invalid={error ? true : undefined}
            />
            {error ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          {step === "input" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="button" onClick={handleNext}>
                Lanjutkan
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => setStep("input")}
              >
                Kembali
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => onConfirm(value)}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                ) : null}
                {saving ? "Menyimpan…" : "Konfirmasi & Simpan"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
