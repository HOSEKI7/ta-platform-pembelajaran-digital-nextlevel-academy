"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmDialog } from "@/components/dashboard/logout-confirm-dialog";

type Props = {
  user: {
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
  };
  /** Settings route for the active role-surface. Defaults to the student
   *  `/settings`; mentor/admin/magang pass their own (a bare `/settings` would
   *  resolve into the `(student)` group and bounce non-students to `/`). */
  settingsHref?: string;
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileMenu({ user, settingsHref = "/settings" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayName = user.username ?? user.name.split(" ")[0];

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      toast.success("Berhasil keluar");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu profil"
        className={cn(
          "group inline-flex h-10 items-center gap-2 rounded-full p-1 pl-1 pr-2 ring-1 ring-zinc-200 transition",
          "hover:ring-[color:var(--color-brand-300)] hover:bg-[color:var(--color-brand-50)]",
          "data-[state=open]:ring-[color:var(--color-brand-400)] data-[state=open]:bg-[color:var(--color-brand-50)]",
          "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:ring-[color:var(--color-surface-border-strong)]",
          "dark:data-[state=open]:ring-[color:var(--color-brand-400)]/60 dark:data-[state=open]:bg-white/5",
        )}
      >
        <Avatar className="size-8">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback className="bg-[color:var(--color-brand-500)] text-[11px] font-bold text-white">
            {initialsOf(user.name) || "NL"}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:inline">
          {displayName}
        </span>
        <ChevronDown
          className="size-3.5 text-zinc-500 transition group-data-[state=open]:rotate-180 dark:text-zinc-400"
          strokeWidth={2.4}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          "z-50 w-64 rounded-2xl p-1.5 ring-1 ring-zinc-200 shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)]",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        {/* Identity header — purely decorative, intentionally a plain div
            rather than MenuPrimitive.GroupLabel which requires a Menu.Group
            ancestor in base-ui. */}
        <div
          className={cn(
            "rounded-xl bg-[color:var(--color-brand-50)] px-3 py-2.5",
            "dark:bg-white/[0.04] dark:ring-1 dark:ring-[color:var(--color-surface-border)]/60",
          )}
        >
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {user.name}
          </div>
          <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {user.email}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 dark:bg-[color:var(--color-surface-border)]" />

        <DropdownMenuItem
          onClick={() => router.push(settingsHref)}
          className="cursor-pointer gap-2 rounded-lg py-2 text-sm dark:focus:bg-white/[0.06]"
        >
          <Settings className="size-4" strokeWidth={2.2} />
          Pengaturan
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={loading}
          onClick={() => setConfirmOpen(true)}
          className="cursor-pointer gap-2 rounded-lg py-2 text-sm text-[color:var(--color-error)] focus:bg-red-50 focus:text-[color:var(--color-error)] dark:focus:bg-red-500/10"
        >
          <LogOut className="size-4" strokeWidth={2.2} />
          {loading ? "Mengeluarkan…" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <LogoutConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      loading={loading}
      onConfirm={handleSignOut}
    />
    </>
  );
}
