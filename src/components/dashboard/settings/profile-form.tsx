"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Lock,
  MailCheck,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  useChangeEmailMutation,
  useRemoveAvatarMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import {
  AVATAR_ACCEPTED_MIME,
  AVATAR_MAX_BYTES,
  changeEmailSchema,
  NAME_MAX,
  updateProfileSchema,
  USERNAME_MAX,
} from "@/lib/validators/account";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { InitialUser } from "./settings-view";

type Draft = {
  name: string;
  username: string;
  email: string;
  image: string | null;
};

type Props = {
  initial: InitialUser;
  draft: Draft;
  onDraftChange: (next: Draft) => void;
  /** When true, render email as read-only and hide the change-email submit
   *  flow. Used for Peserta Magang whose email is admin-managed. */
  lockEmail?: boolean;
};

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "NL"
  );
}

function sanitizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, USERNAME_MAX);
}

const ACCEPTED_MIME_LIST = AVATAR_ACCEPTED_MIME.join(",");

export function ProfileForm({
  initial,
  draft,
  onDraftChange,
  lockEmail = false,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfileMutation();
  const uploadAvatar = useUploadAvatarMutation();
  const removeAvatar = useRemoveAvatarMutation();
  const changeEmail = useChangeEmailMutation();

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
  }>({});

  const profileDirty =
    draft.name !== initial.name ||
    draft.username !== (initial.username ?? "");

  const isEmailDirty =
    !lockEmail &&
    draft.email.trim().toLowerCase() !== initial.email.toLowerCase();

  const profileSaving = updateProfile.isPending;
  const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending;
  const emailSubmitting = changeEmail.isPending;

  function resetProfile() {
    onDraftChange({
      ...draft,
      name: initial.name,
      username: initial.username ?? "",
    });
    setFieldErrors({});
  }

  function resetEmail() {
    onDraftChange({ ...draft, email: initial.email });
    setFieldErrors((e) => ({ ...e, email: undefined }));
  }

  function handleAvatarPick(file: File | null | undefined) {
    if (!file) return;
    if (!AVATAR_ACCEPTED_MIME.includes(file.type as (typeof AVATAR_ACCEPTED_MIME)[number])) {
      toast.error("Format gambar harus PNG, JPG, atau WebP.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Ukuran maksimum 2 MB.");
      return;
    }
    // Optimistic preview while the upload is in flight.
    const reader = new FileReader();
    reader.onload = () => {
      onDraftChange({ ...draft, image: String(reader.result) });
    };
    reader.readAsDataURL(file);

    uploadAvatar.mutate(file, {
      onSuccess: (data) => {
        onDraftChange({ ...draft, image: data.image });
        toast.success("Foto profil diperbarui.");
        router.refresh();
      },
      onError: (err) => {
        onDraftChange({ ...draft, image: initial.image });
        toast.error(err.message || "Gagal mengunggah foto.");
      },
    });
  }

  function handleAvatarRemove() {
    if (!draft.image) return;
    onDraftChange({ ...draft, image: null });
    removeAvatar.mutate(undefined, {
      onSuccess: () => {
        toast.success("Foto profil dihapus.");
        router.refresh();
      },
      onError: (err) => {
        onDraftChange({ ...draft, image: initial.image });
        toast.error(err.message || "Gagal menghapus foto.");
      },
    });
  }

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const patch: { name?: string; username?: string } = {};
    if (draft.name !== initial.name) patch.name = draft.name;
    if (draft.username !== (initial.username ?? "")) patch.username = draft.username;
    if (Object.keys(patch).length === 0) return;

    const parsed = updateProfileSchema.safeParse(patch);
    if (!parsed.success) {
      const errs: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "username") errs[key] = issue.message;
      }
      setFieldErrors(errs);
      toast.error("Periksa kembali isian profil.");
      return;
    }

    updateProfile.mutate(parsed.data, {
      onSuccess: () => {
        toast.success("Profil berhasil disimpan.");
        router.refresh();
      },
      onError: (err) => {
        const msg = err.message || "Gagal menyimpan profil.";
        toast.error(msg);
        if (/username/i.test(msg)) {
          setFieldErrors({ username: msg });
        }
      },
    });
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors((s) => ({ ...s, email: undefined }));
    const parsed = changeEmailSchema.safeParse({ newEmail: draft.email });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Email tidak valid.";
      setFieldErrors((s) => ({ ...s, email: msg }));
      toast.error(msg);
      return;
    }
    changeEmail.mutate(parsed.data, {
      onSuccess: (data) => {
        toast.success(
          data.message ||
            "Tautan verifikasi dikirim. Buka email baru untuk mengaktifkan perubahan.",
        );
      },
      onError: (err) => {
        const msg = err.message || "Gagal mengirim verifikasi email.";
        setFieldErrors((s) => ({ ...s, email: msg }));
        toast.error(msg);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ============= Foto Profil ============= */}
      <Section
        eyebrow="01 · Visual"
        title="Foto profil"
        helper="Foto kotak 1:1 terlihat paling baik. Maks 2MB, format JPG/PNG/WebP."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={avatarBusy}
            className={cn(
              "group relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl ring-1 ring-zinc-200 transition",
              "hover:ring-[color:var(--color-brand-300)] disabled:cursor-not-allowed disabled:opacity-60",
              "dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60",
            )}
            aria-label="Ubah foto profil"
          >
            <Avatar className="size-24 rounded-2xl">
              {draft.image ? (
                <AvatarImage src={draft.image} alt={draft.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[color:var(--color-brand-600)] to-[color:var(--color-brand-400)] text-xl font-extrabold text-white">
                {initialsOf(draft.name)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-zinc-900/65 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white opacity-0 transition group-hover:opacity-100">
              {uploadAvatar.isPending ? (
                <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
              ) : (
                <Camera className="size-3" strokeWidth={2.4} />
              )}
              {uploadAvatar.isPending ? "Mengunggah" : "Ubah"}
            </span>
          </button>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (avatarBusy) return;
              handleAvatarPick(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)]/40 p-4",
              "dark:border-[color:var(--color-brand-500)]/25 dark:bg-[color:var(--color-brand-500)]/[0.06]",
            )}
          >
            <div className="flex items-center gap-2 text-xs text-[color:var(--color-brand-800)] dark:text-[color:var(--color-brand-200)]">
              <ImagePlus className="size-4" strokeWidth={2.4} />
              <span className="font-semibold">
                Tarik & lepas gambar di sini, atau pilih dari perangkat.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_MIME_LIST}
                className="hidden"
                onChange={(e) => handleAvatarPick(e.target.files?.[0])}
              />
              <Button
                type="button"
                size="sm"
                disabled={avatarBusy}
                className="h-9 rounded-full bg-[color:var(--color-brand-500)] px-4 text-xs font-bold text-white shadow-[0_8px_18px_-10px_rgba(43,114,234,0.7)] hover:bg-[color:var(--color-brand-600)]"
                onClick={() => fileRef.current?.click()}
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
                ) : (
                  <Camera className="size-3.5" strokeWidth={2.4} />
                )}
                {uploadAvatar.isPending ? "Mengunggah…" : "Unggah Foto"}
              </Button>
              {draft.image ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={avatarBusy}
                  className="h-9 rounded-full px-3 text-xs font-bold text-[color:var(--color-error)] ring-1 ring-red-200 hover:bg-red-50 hover:text-[color:var(--color-error)] dark:ring-red-500/30 dark:hover:bg-red-500/10"
                  onClick={handleAvatarRemove}
                >
                  {removeAvatar.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
                  ) : (
                    <Trash2 className="size-3.5" strokeWidth={2.4} />
                  )}
                  Hapus
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {/* ============= Identitas ============= */}
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
        <Section
          eyebrow="02 · Identitas"
          title="Nama lengkap & username"
          helper="Nama lengkap akan tercetak pada sertifikat. Username unik dipakai pada @mention dan profil publik."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="name"
              label="Nama lengkap"
              icon={<UserRound className="size-4" strokeWidth={2.4} />}
              hint={`${draft.name.length}/${NAME_MAX}`}
              error={fieldErrors.name}
            >
              <Input
                id="name"
                autoComplete="name"
                maxLength={NAME_MAX}
                value={draft.name}
                placeholder="Contoh: Farid Zahran"
                onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
                className="h-11"
              />
            </Field>

            <Field
              id="username"
              label="Username"
              icon={<AtSign className="size-4" strokeWidth={2.4} />}
              hint={`${draft.username.length}/${USERNAME_MAX}`}
              error={fieldErrors.username}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                  @
                </span>
                <Input
                  id="username"
                  autoComplete="username"
                  spellCheck={false}
                  maxLength={USERNAME_MAX}
                  value={draft.username}
                  placeholder="username"
                  onChange={(e) =>
                    onDraftChange({
                      ...draft,
                      username: sanitizeUsername(e.target.value),
                    })
                  }
                  className="h-11 pl-7 font-mono text-sm"
                />
              </div>
            </Field>
          </div>
        </Section>

        <ActionBar
          dirty={profileDirty}
          saving={profileSaving}
          onReset={resetProfile}
          submitLabel="Simpan Profil"
          icon={<Save className="size-3.5" strokeWidth={2.4} />}
          loadingLabel="Menyimpan…"
          hintIdle="Semua perubahan tersimpan."
          hintDirty="Ada perubahan profil belum disimpan."
        />
      </form>

      {/* ============= Email ============= */}
      {lockEmail ? (
        <Section
          eyebrow="03 · Email"
          title="Alamat email"
          helper="Email akun magang dikelola administrator dan tidak dapat diubah dari halaman ini."
        >
          <Field
            id="email"
            label="Email"
            icon={<MailCheck className="size-4" strokeWidth={2.4} />}
          >
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={initial.email}
                readOnly
                aria-readonly
                tabIndex={-1}
                className="h-11 cursor-not-allowed bg-zinc-50 pr-10 text-zinc-700 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)]"
              />
              <Lock
                aria-hidden
                className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                strokeWidth={2.4}
              />
            </div>
          </Field>

          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-700 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03] dark:text-zinc-200">
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0 text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]"
              strokeWidth={2.4}
            />
            <p className="leading-relaxed">
              Email peserta magang ditetapkan oleh administrator saat
              onboarding batch. Bila kamu perlu mengubahnya, hubungi mentor
              atau administrator program.
            </p>
          </div>
        </Section>
      ) : (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
          <Section
            eyebrow="03 · Email"
            title="Alamat email"
            helper="Mengubah email akan mengirim tautan verifikasi ke alamat baru — perubahan baru aktif setelah verifikasi."
          >
            <Field
              id="email"
              label="Email"
              icon={<MailCheck className="size-4" strokeWidth={2.4} />}
              error={fieldErrors.email}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={draft.email}
                placeholder="nama@email.com"
                onChange={(e) =>
                  onDraftChange({ ...draft, email: e.target.value })
                }
                className="h-11"
              />
            </Field>

            {isEmailDirty ? (
              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                <MailCheck className="mt-0.5 size-4 shrink-0" strokeWidth={2.4} />
                <p className="leading-relaxed">
                  Setelah dikirim, buka tautan verifikasi di{" "}
                  <span className="font-mono font-bold">{draft.email}</span>.
                  Email lama (<span className="font-mono">{initial.email}</span>)
                  tetap aktif sampai verifikasi selesai.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" strokeWidth={2.4} />
                Email saat ini sudah terverifikasi.
              </div>
            )}
          </Section>

          <ActionBar
            dirty={isEmailDirty}
            saving={emailSubmitting}
            onReset={resetEmail}
            submitLabel="Kirim Verifikasi"
            icon={<Send className="size-3.5" strokeWidth={2.4} />}
            loadingLabel="Mengirim…"
            hintIdle="Email saat ini tidak berubah."
            hintDirty="Klik untuk mengirim tautan verifikasi ke email baru."
          />
        </form>
      )}
    </div>
  );
}

type ActionBarProps = {
  dirty: boolean;
  saving: boolean;
  onReset: () => void;
  submitLabel: string;
  loadingLabel: string;
  icon: React.ReactNode;
  hintIdle: string;
  hintDirty: string;
};

function ActionBar({
  dirty,
  saving,
  onReset,
  submitLabel,
  loadingLabel,
  icon,
  hintIdle,
  hintDirty,
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 ring-1 ring-zinc-200 backdrop-blur",
        "shadow-[0_18px_40px_-28px_rgba(35,65,137,0.45)]",
        "dark:bg-[color:var(--color-surface-card)]/85 dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
        {dirty ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 animate-pulse rounded-full bg-[color:var(--color-brand-accent)]" />
            {hintDirty}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" strokeWidth={2.4} />
            {hintIdle}
          </span>
        )}
      </p>
      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || saving}
          onClick={onReset}
          className="h-10 rounded-full px-4 text-xs font-bold ring-1 ring-zinc-200 dark:ring-[color:var(--color-surface-border)]"
        >
          <RotateCcw className="size-3.5" strokeWidth={2.4} />
          Batalkan
        </Button>
        <Button
          type="submit"
          disabled={!dirty || saving}
          className="h-10 rounded-full bg-[color:var(--color-brand-500)] px-5 text-xs font-bold text-white shadow-[0_12px_24px_-12px_rgba(43,114,234,0.7)] hover:bg-[color:var(--color-brand-600)]"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} /> : icon}
          {saving ? loadingLabel : submitLabel}
        </Button>
      </div>
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

type FieldProps = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, icon, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300"
        >
          {icon}
          {label}
        </Label>
        {hint ? (
          <span className="font-mono text-[10px] text-zinc-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-[11px] font-semibold text-[color:var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
