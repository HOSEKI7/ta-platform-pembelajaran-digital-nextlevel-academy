"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Plug,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { AvatarOption } from "@/lib/avatars";
import type { PlatformInfo } from "@/lib/validations/admin-platform-settings";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { IdentityCard } from "@/components/dashboard/settings/identity-card";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { SecurityForm } from "@/components/dashboard/settings/security-form";
import type { InitialUser } from "@/components/dashboard/settings/settings-view";

import { IntegrationStatusPanel } from "./integration-status-panel";
import { PlatformInfoForm } from "./platform-info-form";

export type AdminSettingsTab = "profil" | "keamanan" | "platform" | "integrasi";

const TABS: {
  value: AdminSettingsTab;
  label: string;
  icon: typeof UserRound;
}[] = [
  { value: "profil", label: "Profil", icon: UserRound },
  { value: "keamanan", label: "Keamanan", icon: ShieldCheck },
  { value: "platform", label: "Informasi Platform", icon: Building2 },
  { value: "integrasi", label: "Status Integrasi", icon: Plug },
];

type Props = {
  initial: InitialUser;
  avatarOptions: AvatarOption[];
  platformInfo: PlatformInfo;
  initialTab?: AdminSettingsTab;
};

export function AdminSettingsView({
  initial,
  avatarOptions,
  platformInfo,
  initialTab = "profil",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<AdminSettingsTab>(initialTab);

  // Centralized profile draft so the IdentityCard preview reflects edits live.
  const [draft, setDraft] = useState({
    name: initial.name,
    username: initial.username,
    email: initial.email,
    image: initial.image,
  });

  const isEmailDirty =
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

  function changeTab(next: AdminSettingsTab) {
    setTab(next);
    // Reflect the active tab in the URL without a full navigation.
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Pengaturan"
        title="Pengaturan"
        accent="akun"
        description="Kelola akun administrator, identitas platform, dan pantau status integrasi layanan eksternal."
      />

      <TabSwitcher current={tab} onChange={changeTab} />

      {tab === "profil" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
          <div className="lg:sticky lg:top-24">
            <IdentityCard
              id={initial.id}
              name={draft.name || initial.name}
              username={draft.username}
              email={draft.email}
              image={draft.image}
              emailVerified={initial.emailVerified && !isEmailDirty}
              memberSince={memberSince}
              roleLabel="Administrator"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <ProfileForm
              initial={initial}
              draft={draft}
              onDraftChange={setDraft}
              avatarOptions={avatarOptions}
            />
          </div>
        </div>
      ) : tab === "keamanan" ? (
        <div className="mx-auto w-full max-w-3xl">
          <SecurityForm />
        </div>
      ) : tab === "platform" ? (
        <div className="mx-auto w-full max-w-3xl">
          <PlatformInfoForm initial={platformInfo} />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          <IntegrationStatusPanel />
        </div>
      )}
    </div>
  );
}

type TabSwitcherProps = {
  current: AdminSettingsTab;
  onChange: (next: AdminSettingsTab) => void;
};

function TabSwitcher({ current, onChange }: TabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Tab pengaturan admin"
      className={cn(
        "relative grid w-full grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-zinc-200 sm:grid-cols-4",
        "shadow-[0_24px_40px_-32px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
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
              "relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_10px_22px_-12px_rgba(43,114,234,0.7)]"
                : "text-zinc-500 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] dark:text-zinc-300/80 dark:hover:bg-white/[0.04] dark:hover:text-[color:var(--color-brand-200)]",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2.4} />
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
