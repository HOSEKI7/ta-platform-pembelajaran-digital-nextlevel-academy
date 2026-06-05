"use client";

import { useState } from "react";
import { Loader2, Mail, Plus, ShieldAlert, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

import type {
  AdminAccountRow,
  PendingInviteRow,
} from "@/lib/admin-accounts-loader";
import { useAdminAccountsQuery } from "@/hooks/use-admin-accounts";
import {
  useDeleteAdminMutation,
  useRevokeInviteMutation,
  useToggleAdminStatusMutation,
} from "@/hooks/use-admin-account-actions";

import { PageHeader } from "@/components/dashboard/shared/page-header";

import { AdminsTable } from "./admins-table";
import { PendingInvitesTable } from "./pending-invites-table";
import { InviteAdminDialog } from "./invite-admin-dialog";
import { AdminConfirmDialog } from "./admin-confirm-dialog";

type Props = {
  currentAdminId: string;
};

export function AdminAccountsView({ currentAdminId }: Props) {
  const query = useAdminAccountsQuery();
  const toggleMutation = useToggleAdminStatusMutation();
  const deleteMutation = useDeleteAdminMutation();
  const revokeMutation = useRevokeInviteMutation();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [toToggle, setToToggle] = useState<AdminAccountRow | null>(null);
  const [toDelete, setToDelete] = useState<AdminAccountRow | null>(null);
  const [toRevoke, setToRevoke] = useState<PendingInviteRow | null>(null);

  const data = query.data;
  const isFetching = query.isFetching;
  const admins = data?.admins ?? [];
  const pendingInvites = data?.pendingInvites ?? [];
  const tooManyAdmins = data?.tooManyAdmins ?? false;
  const activeAdminCount = data?.activeAdminCount ?? 0;

  const handleConfirmToggle = () => {
    if (!toToggle) return;
    const nextActive = !toToggle.isActive;
    toggleMutation.mutate(
      { userId: toToggle.id, isActive: nextActive },
      {
        onSuccess: () => {
          toast.success(
            nextActive
              ? `“${toToggle.name}” diaktifkan.`
              : `“${toToggle.name}” dinonaktifkan.`,
          );
          setToToggle(null);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Gagal mengubah status."),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`Administrator “${toDelete.name}” dihapus.`);
        setToDelete(null);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menghapus administrator."),
    });
  };

  const handleConfirmRevoke = () => {
    if (!toRevoke) return;
    revokeMutation.mutate(toRevoke.id, {
      onSuccess: () => {
        toast.success(`Undangan untuk ${toRevoke.email} dibatalkan.`);
        setToRevoke(null);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal membatalkan undangan."),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Manajemen"
        title="Akun"
        accent="Administrator"
        description="Undang administrator baru, kelola status akun, dan pantau undangan yang masih berjalan."
      />

      {/* Security warning when there are too many active admins */}
      {tooManyAdmins ? (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" strokeWidth={2.2} />
          <p>
            Saat ini ada{" "}
            <span className="font-bold">{activeAdminCount} administrator aktif</span>{" "}
            (lebih dari 5). Terlalu banyak administrator memperbesar risiko
            keamanan, kebocoran privasi, dan kontrol data yang berlebihan.
            Pertimbangkan untuk menonaktifkan akun yang tidak lagi diperlukan.
          </p>
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {activeAdminCount} administrator aktif
          {pendingInvites.length > 0
            ? ` · ${pendingInvites.length} undangan menunggu`
            : null}
        </p>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)]"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Undang Admin
        </button>
      </div>

      {/* Admins card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <UserCog className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Administrator
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {admins.length > 0
                  ? `${admins.length} administrator`
                  : "Belum ada administrator"}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {query.isPending ? (
          <CardSkeleton />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : admins.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-5" />}
            text="Belum ada administrator lain."
          />
        ) : (
          <AdminsTable
            admins={admins}
            currentAdminId={currentAdminId}
            isFetching={isFetching}
            onToggleStatus={setToToggle}
            onDelete={setToDelete}
          />
        )}
      </section>

      {/* Pending invites card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
          <span className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
            <Mail className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              Undangan Menunggu
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {pendingInvites.length > 0
                ? `${pendingInvites.length} undangan belum diterima`
                : "Tidak ada undangan yang menunggu"}
            </p>
          </div>
        </div>

        {query.isPending ? (
          <CardSkeleton />
        ) : pendingInvites.length === 0 ? (
          <EmptyState
            icon={<Mail className="size-5" />}
            text="Tidak ada undangan yang masih berjalan."
          />
        ) : (
          <PendingInvitesTable
            invites={pendingInvites}
            isFetching={isFetching}
            onRevoke={setToRevoke}
          />
        )}
      </section>

      <InviteAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        tooManyAdmins={tooManyAdmins}
      />

      <AdminConfirmDialog
        open={toToggle !== null}
        onOpenChange={(o) => {
          if (!o && !toggleMutation.isPending) setToToggle(null);
        }}
        tone={toToggle?.isActive ? "warning" : "success"}
        title={
          toToggle?.isActive
            ? "Nonaktifkan administrator ini?"
            : "Aktifkan kembali administrator ini?"
        }
        description={
          toToggle?.isActive ? (
            <>
              <span className="font-semibold text-foreground">“{toToggle?.name}”</span>{" "}
              tidak akan bisa login dan sesi aktifnya dicabut. Bisa diaktifkan lagi
              kapan saja.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">“{toToggle?.name}”</span>{" "}
              akan bisa login kembali menggunakan kredensial yang ada.
            </>
          )
        }
        confirmLabel={toToggle?.isActive ? "Nonaktifkan" : "Aktifkan"}
        pendingLabel="Memproses…"
        loading={toggleMutation.isPending}
        onConfirm={handleConfirmToggle}
      />

      <AdminConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => {
          if (!o && !deleteMutation.isPending) setToDelete(null);
        }}
        tone="danger"
        title="Hapus administrator ini?"
        description={
          <>
            Akun{" "}
            <span className="font-semibold text-foreground">“{toDelete?.name}”</span>{" "}
            akan dihapus dan tidak lagi bisa login. Datanya tetap disimpan untuk
            audit, namun tindakan ini tidak dapat dibatalkan dari panel.
          </>
        }
        confirmLabel="Hapus Administrator"
        pendingLabel="Menghapus…"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />

      <AdminConfirmDialog
        open={toRevoke !== null}
        onOpenChange={(o) => {
          if (!o && !revokeMutation.isPending) setToRevoke(null);
        }}
        tone="danger"
        title="Batalkan undangan ini?"
        description={
          <>
            Tautan undangan untuk{" "}
            <span className="font-semibold text-foreground">{toRevoke?.email}</span>{" "}
            akan langsung tidak berlaku.
          </>
        }
        confirmLabel="Batalkan Undangan"
        pendingLabel="Membatalkan…"
        loading={revokeMutation.isPending}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-10 shrink-0 rounded-full bg-zinc-100 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-zinc-100 dark:bg-white/5" />
            <div className="h-3 w-1/4 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
          </div>
          <div className="h-6 w-20 rounded-full bg-zinc-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Gagal memuat daftar administrator
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        {icon}
      </span>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{text}</p>
    </div>
  );
}
