"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LayoutDashboard, LogOut, Menu, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/generated/prisma";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutConfirmDialog } from "@/components/dashboard/logout-confirm-dialog";

import { PUBLIC_NAV_LINKS, dashboardHrefFor, roleLabel } from "./public-nav-config";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    image?: string | null;
  } | null;
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      toast.success("Berhasil keluar");
      setConfirmOpen(false);
      setOpen(false);
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Buka menu"
          className="grid size-10 place-items-center rounded-full ring-1 ring-zinc-200 transition hover:ring-[color:var(--color-brand-300)] lg:hidden"
        >
          <Menu className="size-5 text-zinc-700" strokeWidth={2.2} />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-zinc-100 bg-white p-0 sm:max-w-sm [&>button]:hidden"
        >
          <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-100 px-6 py-5">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Link
              href="/"
              aria-label="NextLevel Academy beranda"
              onClick={() => setOpen(false)}
              className="inline-flex items-center"
            >
              <Image
                src="/nla-horizontal-logo.webp"
                alt="NextLevel Academy"
                width={1397}
                height={351}
                className="h-10 w-auto"
              />
            </Link>
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:text-zinc-900"
            >
              <X className="size-4" />
            </button>
          </SheetHeader>

          <div className="flex flex-1 flex-col px-6 py-6">
            {user ? (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[color:var(--color-brand-50)] p-3 ring-1 ring-[color:var(--color-brand-100)]">
                <Avatar className="size-11">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-white text-sm font-semibold text-[color:var(--color-brand-900)]">
                    {initialsOf(user.name) || "NL"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-zinc-900">
                    {user.name}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {user.email}
                  </div>
                </div>
                <Badge className="bg-white text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brand-700)] hover:bg-white">
                  {roleLabel(user.role)}
                </Badge>
              </div>
            ) : null}

            <nav className="flex flex-col gap-1">
              {PUBLIC_NAV_LINKS.map((link) => {
                if (link.disabled) {
                  return (
                    <span
                      key={link.href}
                      aria-disabled="true"
                      title="Segera hadir"
                      className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-400"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="size-1.5 rounded-full bg-zinc-200" />
                        {link.label}
                      </span>
                      {link.comingSoon ? (
                        <span className="rounded-full bg-[color:var(--color-brand-accent)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40">
                          Soon
                        </span>
                      ) : null}
                    </span>
                  );
                }
                const active = link.exact
                  ? pathname === link.href
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition",
                      active
                        ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-900)]"
                        : "text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span
                        className={cn(
                          "size-1.5 rounded-full transition",
                          active
                            ? "bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"
                            : "bg-zinc-300 group-hover:bg-zinc-400",
                        )}
                      />
                      {link.label}
                    </span>
                    <ArrowRight
                      className={cn(
                        "size-4 transition",
                        active
                          ? "text-[color:var(--color-brand-700)]"
                          : "text-zinc-300 group-hover:translate-x-0.5 group-hover:text-zinc-500",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-2 pt-8">
              {user ? (
                <>
                  <Link
                    href={dashboardHrefFor(user.role)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
                  >
                    <LayoutDashboard className="size-4" /> Buka Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-[color:var(--color-error)] ring-1 ring-red-100 transition hover:bg-red-50"
                  >
                    <LogOut className="size-4" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
                  >
                    Daftar Gratis <Sparkles className="size-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <LogoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={loading}
        onConfirm={handleSignOut}
      />
    </>
  );
}
