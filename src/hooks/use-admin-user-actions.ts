"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

const ADMIN_USERS_KEY = ["admin", "users"] as const;

/** Soft-delete a user (server guards self/admin deletion → 403). */
export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus pengguna."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

/** Enable/disable a user account (Nonaktifkan / Aktifkan). */
export function useToggleUserStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/users/${vars.userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: vars.isActive }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal mengubah status akun."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

/** Set a temporary password for a Peserta Didik (forces change at next login). */
export function useSetTempPasswordMutation() {
  return useMutation({
    mutationFn: async (vars: { userId: string; tempPassword: string }) => {
      const res = await fetch(`/api/admin/users/${vars.userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword: vars.tempPassword }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menyetel password sementara."));
      }
    },
  });
}
