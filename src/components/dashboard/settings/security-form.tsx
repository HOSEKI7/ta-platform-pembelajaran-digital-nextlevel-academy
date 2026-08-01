"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Save,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useChangePasswordMutation } from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { changePasswordSchema } from "@/lib/validators/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordRule = {
  label: string;
  test: (v: string) => boolean;
};

/** Mandatory rules (PRD §6.1.1) — these gate submission. */
const RULES: PasswordRule[] = [
  { label: "Minimal 8 karakter", test: (v) => v.length >= 8 },
  { label: "Mengandung huruf besar (A–Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "Mengandung huruf kecil (a–z)", test: (v) => /[a-z]/.test(v) },
  { label: "Mengandung angka (0–9)", test: (v) => /\d/.test(v) },
];

/** Optional bonus — not required, but lights up the 5th strength bar. */
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/;

function strengthOf(value: string) {
  const passed = RULES.filter((r) => r.test(value)).length;
  // 5th bar is a bonus for adding a special character.
  const bonus = SPECIAL_CHAR_RE.test(value) ? 1 : 0;
  return Math.min(passed + bonus, 5);
}

const STRENGTH_LABELS = [
  { label: "Belum diisi", tone: "muted" },
  { label: "Sangat lemah", tone: "red" },
  { label: "Lemah", tone: "amber" },
  { label: "Cukup", tone: "amber" },
  { label: "Kuat", tone: "emerald" },
  { label: "Sangat kuat", tone: "emerald" },
] as const;

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ cur: false, next: false, conf: false });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const mutation = useChangePasswordMutation();
  const saving = mutation.isPending;

  const ruleStatus = useMemo(
    () => RULES.map((r) => ({ ...r, ok: r.test(next) })),
    [next],
  );
  // Mandatory rules + the optional special-character bonus (does not gate submit).
  const checklistItems = useMemo(
    () => [
      ...ruleStatus.map((r) => ({ label: r.label, ok: r.ok, optional: false })),
      {
        label: "Karakter spesial (mis. ! @ # $)",
        ok: SPECIAL_CHAR_RE.test(next),
        optional: true,
      },
    ],
    [ruleStatus, next],
  );
  const score = strengthOf(next);
  const meter = STRENGTH_LABELS[score];

  const confirmMatches = confirm.length > 0 && confirm === next;
  const confirmMismatch = confirm.length > 0 && confirm !== next;
  const allRulesOk = ruleStatus.every((r) => r.ok);
  const canSubmit =
    current.length > 0 &&
    next.length > 0 &&
    confirm.length > 0 &&
    confirmMatches &&
    allRulesOk &&
    current !== next;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);

    const parsed = changePasswordSchema.safeParse({
      currentPassword: current,
      newPassword: next,
      confirmPassword: confirm,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Periksa kembali isian password.";
      setFieldError(msg);
      toast.error(msg);
      return;
    }

    mutation.mutate(parsed.data, {
      onSuccess: () => {
        setCurrent("");
        setNext("");
        setConfirm("");
        toast.success(
          "Password berhasil diperbarui. Notifikasi dikirim ke email kamu.",
        );
      },
      onError: (err) => {
        const msg = err.message || "Gagal memperbarui password.";
        setFieldError(msg);
        toast.error(msg);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Ubah password */}
      <Section
        eyebrow="01 · Otentikasi"
        title="Ubah password"
        helper="Gunakan kombinasi huruf besar, kecil, dan angka. Jangan pakai password yang sama dengan akun lain."
      >
        <div className="grid gap-5">
          <PasswordField
            id="current-password"
            label="Password lama"
            value={current}
            onChange={setCurrent}
            visible={show.cur}
            onToggleVisible={() => setShow((s) => ({ ...s, cur: !s.cur }))}
            autoComplete="current-password"
          />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)] lg:items-start">
            <div className="flex flex-col gap-3">
              <PasswordField
                id="new-password"
                label="Password baru"
                value={next}
                onChange={setNext}
                visible={show.next}
                onToggleVisible={() => setShow((s) => ({ ...s, next: !s.next }))}
                autoComplete="new-password"
              />

              <StrengthMeter score={score} label={meter.label} tone={meter.tone} />
            </div>

            <ChecklistCard items={checklistItems} />
          </div>

          <PasswordField
            id="confirm-password"
            label="Konfirmasi password baru"
            value={confirm}
            onChange={setConfirm}
            visible={show.conf}
            onToggleVisible={() => setShow((s) => ({ ...s, conf: !s.conf }))}
            autoComplete="new-password"
            hint={
              confirmMatches
                ? { tone: "ok", text: "Cocok dengan password baru" }
                : confirmMismatch
                  ? { tone: "err", text: "Konfirmasi belum sama dengan password baru" }
                  : undefined
            }
          />

          {current.length > 0 && next.length > 0 && current === next ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <ShieldAlert className="size-4" strokeWidth={2.4} />
              Password baru tidak boleh sama dengan yang lama.
            </div>
          ) : null}
        </div>
      </Section>

      {/* Notifikasi keamanan (informational) */}
      <Section
        eyebrow="02 · Pemberitahuan"
        title="Notifikasi keamanan"
        helper="Setiap perubahan password dan login baru akan dikirim ke email aktif. Pengaturan ini selalu aktif."
      >
        <div className="flex items-start gap-4 rounded-2xl border border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)]/60 p-4 dark:border-[color:var(--color-brand-500)]/25 dark:bg-[color:var(--color-brand-500)]/[0.07]">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)]">
            <BellRing className="size-4" strokeWidth={2.4} />
          </div>
          <div className="flex-1 text-xs leading-relaxed text-[color:var(--color-brand-900)] dark:text-[color:var(--color-brand-100)]">
            <p className="font-bold">Email peringatan keamanan aktif</p>
            <p className="mt-0.5">
              Kamu akan menerima notifikasi setiap kali password berubah,
              sehingga jika ada percobaan akses tidak sah, kamu bisa segera
              merespons.
            </p>
          </div>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25">
            <ShieldCheck className="size-3" strokeWidth={2.6} />
            Aktif
          </span>
        </div>
      </Section>

      {/* Action bar */}
      <div
        className={cn(
          "sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 ring-1 ring-zinc-200 backdrop-blur",
          "shadow-[0_18px_40px_-28px_rgba(35,65,137,0.45)]",
          "dark:bg-[color:var(--color-surface-card)]/85 dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        <p
          className={cn(
            "hidden text-xs sm:flex sm:items-center sm:gap-2",
            fieldError
              ? "text-[color:var(--color-error)]"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Lock className="size-3.5" strokeWidth={2.4} />
          {fieldError
            ? fieldError
            : canSubmit
              ? "Siap diperbarui — kami kirim notifikasi ke email setelah disimpan."
              : "Lengkapi semua kolom sesuai aturan keamanan."}
        </p>
        <Button
          type="submit"
          disabled={!canSubmit || saving}
          className="h-10 rounded-full bg-[color:var(--color-brand-500)] px-5 text-xs font-bold text-white shadow-[0_12px_24px_-12px_rgba(43,114,234,0.7)] hover:bg-[color:var(--color-brand-600)]"
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
          ) : (
            <Save className="size-3.5" strokeWidth={2.4} />
          )}
          {saving ? "Menyimpan…" : "Perbarui Password"}
        </Button>
      </div>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete: string;
  hint?: { tone: "ok" | "err"; text: string };
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
  hint,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300"
      >
        <KeyRound className="size-3.5" strokeWidth={2.4} />
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={64}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-11 pr-12 font-mono tracking-wider"
        />
        <button
          type="button"
          aria-label={visible ? "Sembunyikan password" : "Lihat password"}
          onClick={onToggleVisible}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-lg text-zinc-500 transition",
            "hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)]",
            "dark:hover:bg-white/[0.06] dark:hover:text-[color:var(--color-brand-200)]",
          )}
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={2.2} />
          ) : (
            <Eye className="size-4" strokeWidth={2.2} />
          )}
        </button>
      </div>
      {hint ? (
        <p
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold",
            hint.tone === "ok"
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-[color:var(--color-error)]",
          )}
        >
          {hint.tone === "ok" ? (
            <Check className="size-3.5" strokeWidth={2.6} />
          ) : (
            <X className="size-3.5" strokeWidth={2.6} />
          )}
          {hint.text}
        </p>
      ) : null}
    </div>
  );
}

function StrengthMeter({
  score,
  label,
  tone,
}: {
  score: number;
  label: string;
  tone: "muted" | "red" | "amber" | "emerald";
}) {
  const bars = 5;
  const toneClass: Record<typeof tone, string> = {
    muted: "bg-zinc-200 dark:bg-white/10",
    red: "bg-red-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };
  const textTone: Record<typeof tone, string> = {
    muted: "text-zinc-400",
    red: "text-red-600 dark:text-red-300",
    amber: "text-amber-600 dark:text-amber-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: bars }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              idx < score ? toneClass[tone] : "bg-zinc-200 dark:bg-white/10",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "min-w-24 text-right text-[10px] font-bold uppercase tracking-[0.16em]",
          textTone[tone],
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ChecklistCard({
  items,
}: {
  items: { label: string; ok: boolean; optional: boolean }[];
}) {
  return (
    <div className="rounded-2xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200 dark:bg-white/[0.025] dark:ring-[color:var(--color-surface-border)]">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Syarat password
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((r) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-2 text-[11px] font-semibold transition",
              r.ok
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            <span
              className={cn(
                "grid size-4 place-items-center rounded-full ring-1 transition",
                r.ok
                  ? "bg-emerald-500 text-white ring-emerald-500"
                  : "bg-white ring-zinc-300 dark:bg-transparent dark:ring-[color:var(--color-surface-border)]",
              )}
            >
              {r.ok ? <Check className="size-2.5" strokeWidth={3} /> : null}
            </span>
            <span>
              {r.label}
              {r.optional ? (
                <span className="ml-1 font-medium text-zinc-400 dark:text-zinc-500">
                  · opsional
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SectionProps = {
  eyebrow: string;
  title: string;
  helper: string;
  children: React.ReactNode;
};

function Section({ eyebrow, title, helper, children }: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <header className="mb-5 flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
          {eyebrow}
        </span>
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-300/70">
          {helper}
        </p>
      </header>
      {children}
    </section>
  );
}
