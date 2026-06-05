"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminAccountsKey } from "@/hooks/use-admin-accounts";
import type { InviteAdminInput } from "@/lib/validations/admin-invite";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

export type InviteAdminResult = { id: string; inviteUrl?: string };

/** Invite a new admin via email. Returns the invite URL when no email was sent. */
export function useInviteAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: InviteAdminInput): Promise<InviteAdminResult> => {
      const res = await fetch("/api/admin/admins/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal mengirim undangan."));
      }
      const json = (await res.json()) as { data: InviteAdminResult };
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountsKey }),
  });
}

/** Cancel a still-pending invite. */
export function useRevokeInviteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/admin/admins/invite/${inviteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal membatalkan undangan."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountsKey }),
  });
}

/** Activate / deactivate another admin (server guards self + last-active). */
export function useToggleAdminStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/admins/${vars.userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: vars.isActive }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal mengubah status administrator."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountsKey }),
  });
}

/** Soft-delete another admin (server guards self + last-active). */
export function useDeleteAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/admins/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus administrator."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountsKey }),
  });
}
