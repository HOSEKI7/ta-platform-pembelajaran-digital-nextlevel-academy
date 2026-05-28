"use client";

import { useMemo, useState } from "react";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/shared/page-header";

import { IdentityCard } from "./identity-card";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";

export type InitialUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
};

type Tab = "profil" | "keamanan";

type Props = {
  initial: InitialUser;
  /** When true, email field is rendered read-only and the change-email
   *  section is suppressed. Used by the Peserta Magang surface, whose
   *  email is admin-managed at onboarding (PRD §6.1). */
  lockEmail?: boolean;
  /** Badge text shown in the IdentityCard. Defaults to "Peserta Didik". */
  roleLabel?: string;
  /** Optional override for the PageHeader description copy. */
  headerDescription?: string;
};

const TABS: { value: Tab; label: string; helper: string; icon: typeof UserRound }[] = [
  {
    value: "profil",
    label: "Profil",
    helper: "Identitas, username, foto, dan email.",
    icon: UserRound,
  },
  {
    value: "keamanan",
    label: "Keamanan",
    helper: "Ubah password dan notifikasi keamanan.",
    icon: ShieldCheck,
  },
];

export function SettingsView({
  initial,
  lockEmail = false,
  roleLabel = "Peserta Didik",
  headerDescription,
}: Props) {
  const [tab, setTab] = useState<Tab>("profil");

  // Centralized form state so the IdentityCard preview reflects edits live.
  const [draft, setDraft] = useState({
    name: initial.name,
    username: initial.username,
    email: initial.email,
    image: initial.image,
  });

  // When email is locked the draft can't drift, so the badge never has to
  // flip into the "Perlu Verifikasi" state mid-edit.
  const isEmailDirty =
    !lockEmail &&
    draft.email.trim().toLowerCase() !== initial.email.toLowerCase();

  const memberSince = useMemo(() => {
    try {
      return new Date(initial.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }, [initial.createdAt]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Akun · Studio Identitas"
        title="Pengaturan"
        accent="akun"
        description={
          headerDescription ??
          (lockEmail
            ? "Atur identitas, foto, dan keamanan akun magangmu di NextLevel Academy. Email magang dikelola administrator dan tidak dapat diubah dari halaman ini."
            : "Atur identitas yang tampil di kursus, sertifikat, dan komunitas. Setiap perubahan tersimpan terpisah — kamu bisa mengubah profil atau password kapan saja.")
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
        <div className="lg:sticky lg:top-24">
          <IdentityCard
            id={initial.id}
            name={draft.name || initial.name}
            username={draft.username}
            email={lockEmail ? initial.email : draft.email}
            image={draft.image}
            emailVerified={initial.emailVerified && !isEmailDirty}
            memberSince={memberSince}
            roleLabel={roleLabel}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <TabSwitcher current={tab} onChange={setTab} />

          {tab === "profil" ? (
            <ProfileForm
              initial={initial}
              draft={draft}
              onDraftChange={setDraft}
              lockEmail={lockEmail}
            />
          ) : (
            <SecurityForm />
          )}
        </div>
      </div>
    </div>
  );
}

type TabSwitcherProps = {
  current: Tab;
  onChange: (next: Tab) => void;
};

function TabSwitcher({ current, onChange }: TabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Tab pengaturan akun"
      className={cn(
        "relative inline-grid w-full grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-zinc-200",
        "shadow-[0_24px_40px_-32px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        "sm:max-w-md",
      )}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = current === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              active
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_10px_22px_-12px_rgba(43,114,234,0.7)]"
                : "text-zinc-500 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] dark:text-zinc-300/80 dark:hover:bg-white/[0.04] dark:hover:text-[color:var(--color-brand-200)]",
            )}
          >
            <Icon className="size-4" strokeWidth={2.4} />
            {t.label}
            {t.value === "keamanan" && active ? (
              <KeyRound className="ml-1 size-3 opacity-80" strokeWidth={2.4} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
