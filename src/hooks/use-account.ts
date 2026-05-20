"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

type ApiResult<T> = { data: T; error?: never } | { error: string; data?: never };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!res.ok || "error" in json) {
    throw new Error("error" in json ? json.error : `Request failed (${res.status})`);
  }
  return json.data;
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!res.ok || "error" in json) {
    throw new Error("error" in json ? json.error : `Request failed (${res.status})`);
  }
  return json.data;
}

async function send<T>(method: "POST" | "DELETE", path: string, body?: FormData): Promise<T> {
  const res = await fetch(path, {
    method,
    body,
    cache: "no-store",
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!res.ok || "error" in json) {
    throw new Error("error" in json ? json.error : `Request failed (${res.status})`);
  }
  return json.data;
}

export type UpdateProfilePayload = {
  name?: string;
  username?: string;
  image?: string | null;
};

export type UpdateProfileResponse = {
  name: string;
  username: string | null;
  image: string | null;
};

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: (payload) =>
      patchJson<UpdateProfileResponse>("/api/account/profile", payload),
    onSuccess: () => {
      // Trigger Better Auth session refetch so name/username/image flip on
      // sidebar, topbar, etc. immediately.
      authClient.getSession({ query: { disableCookieCache: true } });
      qc.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export type ChangeEmailResponse = {
  message: string;
  newEmail: string;
};

export function useChangeEmailMutation() {
  return useMutation<ChangeEmailResponse, Error, { newEmail: string }>({
    mutationFn: (payload) =>
      postJson<ChangeEmailResponse>("/api/account/email-change", payload),
  });
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function useChangePasswordMutation() {
  return useMutation<{ message: string }, Error, ChangePasswordPayload>({
    mutationFn: (payload) =>
      postJson<{ message: string }>("/api/account/password", payload),
  });
}

export type AvatarResponse = { image: string | null };

export function useUploadAvatarMutation() {
  const qc = useQueryClient();
  return useMutation<AvatarResponse, Error, File>({
    mutationFn: (file) => {
      const form = new FormData();
      form.append("file", file);
      return send<AvatarResponse>("POST", "/api/account/avatar", form);
    },
    onSuccess: () => {
      authClient.getSession({ query: { disableCookieCache: true } });
      qc.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useRemoveAvatarMutation() {
  const qc = useQueryClient();
  return useMutation<AvatarResponse, Error, void>({
    mutationFn: () => send<AvatarResponse>("DELETE", "/api/account/avatar"),
    onSuccess: () => {
      authClient.getSession({ query: { disableCookieCache: true } });
      qc.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
