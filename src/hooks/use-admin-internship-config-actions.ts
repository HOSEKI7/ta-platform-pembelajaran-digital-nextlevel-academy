"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { internshipConfigKey } from "@/lib/admin-internship-config-query";
import type {
  BatchFormInput,
  ClassCreateInput,
  ClassUpdateInput,
  FieldCreateInput,
  FieldUpdateInput,
} from "@/lib/validations/admin-internship-config";

const BASE = "/api/admin/internship/config";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

async function send(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  fallback: string,
  payload?: unknown,
): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!res.ok) throw new Error(await parseError(res, fallback));
}

/** All config mutations invalidate the single config query on success. */
function useConfigMutation<TVars>(
  fn: (vars: TVars) => Promise<void>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: internshipConfigKey }),
  });
}

// ---- Batch -----------------------------------------------------------------

export function useCreateBatchMutation() {
  return useConfigMutation((values: BatchFormInput) =>
    send(`${BASE}/batches`, "POST", "Gagal membuat batch.", values),
  );
}

export function useUpdateBatchMutation(id: string) {
  return useConfigMutation((values: BatchFormInput) =>
    send(`${BASE}/batches/${id}`, "PATCH", "Gagal menyimpan batch.", values),
  );
}

export function useDeleteBatchMutation() {
  return useConfigMutation((id: string) =>
    send(`${BASE}/batches/${id}`, "DELETE", "Gagal menghapus batch."),
  );
}

// ---- Bidang ----------------------------------------------------------------

export function useCreateFieldMutation() {
  return useConfigMutation((values: FieldCreateInput) =>
    send(`${BASE}/fields`, "POST", "Gagal membuat bidang.", values),
  );
}

export function useUpdateFieldMutation(id: string) {
  return useConfigMutation((values: FieldUpdateInput) =>
    send(`${BASE}/fields/${id}`, "PATCH", "Gagal menyimpan bidang.", values),
  );
}

export function useDeleteFieldMutation() {
  return useConfigMutation((id: string) =>
    send(`${BASE}/fields/${id}`, "DELETE", "Gagal menghapus bidang."),
  );
}

// ---- Kelas -----------------------------------------------------------------

export function useCreateClassMutation() {
  return useConfigMutation((values: ClassCreateInput) =>
    send(`${BASE}/classes`, "POST", "Gagal membuat kelas.", values),
  );
}

export function useUpdateClassMutation(id: string) {
  return useConfigMutation((values: ClassUpdateInput) =>
    send(`${BASE}/classes/${id}`, "PATCH", "Gagal menyimpan kelas.", values),
  );
}

export function useDeleteClassMutation() {
  return useConfigMutation((id: string) =>
    send(`${BASE}/classes/${id}`, "DELETE", "Gagal menghapus kelas."),
  );
}
