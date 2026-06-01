"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { holidayConfigKey } from "@/lib/admin-internship-holiday-query";
import type {
  HolidayCreateInput,
  HolidayEditFormInput,
  HolidayEndEarlyFormInput,
} from "@/lib/validations/admin-internship-holiday";

const BASE = "/api/admin/internship/holidays";

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

/** All holiday mutations invalidate the single holiday query on success. */
function useHolidayMutation<TVars>(fn: (vars: TVars) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: holidayConfigKey }),
  });
}

export function useCreateHolidayMutation() {
  return useHolidayMutation((values: HolidayCreateInput) =>
    send(BASE, "POST", "Gagal menambah libur.", values),
  );
}

/** UPCOMING full edit — the hook tags the payload with `mode: "edit"`. */
export function useEditHolidayMutation(id: string) {
  return useHolidayMutation((values: HolidayEditFormInput) =>
    send(`${BASE}/${id}`, "PATCH", "Gagal menyimpan libur.", {
      mode: "edit",
      ...values,
    }),
  );
}

/** ACTIVE end-early — the hook tags the payload with `mode: "endEarly"`. */
export function useEndEarlyHolidayMutation(id: string) {
  return useHolidayMutation((values: HolidayEndEarlyFormInput) =>
    send(`${BASE}/${id}`, "PATCH", "Gagal mengakhiri libur.", {
      mode: "endEarly",
      ...values,
    }),
  );
}

export function useDeleteHolidayMutation() {
  return useHolidayMutation((id: string) =>
    send(`${BASE}/${id}`, "DELETE", "Gagal menghapus libur."),
  );
}
