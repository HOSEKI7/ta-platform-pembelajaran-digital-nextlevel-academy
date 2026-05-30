"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateUserInput,
  EditUserInput,
} from "@/lib/validations/admin-user";

async function sendJson(
  url: string,
  method: "POST" | "PATCH",
  payload: unknown,
): Promise<{ id: string }> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: { id: string }; error?: string }
    | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.error ?? `Gagal menyimpan pengguna (${res.status}).`);
  }
  return body.data;
}

/** Create an admin-managed account. Returns the new user id. */
export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateUserInput) =>
      sendJson("/api/admin/users", "POST", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

/** Update an existing account (role is locked server-side). */
export function useUpdateUserMutation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: EditUserInput) =>
      sendJson(`/api/admin/users/${userId}`, "PATCH", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
