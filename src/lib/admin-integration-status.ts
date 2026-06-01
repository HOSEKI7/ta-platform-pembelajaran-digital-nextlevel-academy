import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Live connectivity probes for the admin "Status Integrasi" tab (PRD §6.11.11).
 *
 * Design: secrets NEVER leave `.env` — this module reads `process.env` purely
 * to *probe* each service and reports a coarse state. It never returns key
 * values to the client. A `connected` result means an authenticated round-trip
 * actually succeeded (not merely that the env var is non-empty), per the
 * requirement that ✅ reflect real reachability.
 *
 * States:
 *   - `not_configured` — env missing → no ping attempted
 *   - `connected`      — authenticated probe succeeded
 *   - `failed`         — env present but probe failed (bad key, network, etc.)
 *
 * All probes run in parallel with a short per-call timeout so the endpoint
 * stays responsive even when a vendor is slow/down.
 */

export type IntegrationState = "connected" | "failed" | "not_configured";

export type IntegrationCheck = {
  id: string;
  label: string;
  /** Short human description of what the service powers. */
  description: string;
  state: IntegrationState;
  /** Optional extra context (e.g. "Sandbox", "HTTP 401"). Never a secret. */
  detail?: string;
};

const PROBE_TIMEOUT_MS = 4000;

/** Fetch with an AbortController timeout. Returns the Response or throws. */
async function timedFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

const optionalEnv = (name: string): string => {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : "";
};

// ---- Database ---------------------------------------------------------------

async function checkDatabase(): Promise<IntegrationCheck> {
  const base = {
    id: "database",
    label: "Database (PostgreSQL)",
    description: "Penyimpanan utama seluruh data platform.",
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ...base, state: "connected" };
  } catch {
    return { ...base, state: "failed", detail: "Query gagal" };
  }
}

// ---- Midtrans ---------------------------------------------------------------

async function checkMidtrans(): Promise<IntegrationCheck> {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const base = {
    id: "midtrans",
    label: "Midtrans (Pembayaran)",
    description: "Gateway pembayaran untuk pembelian kursus.",
  };
  const serverKey = optionalEnv("MIDTRANS_SERVER_KEY");
  if (!serverKey) return { ...base, state: "not_configured" };

  const apiBase = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
  const detail = isProduction ? "Production" : "Sandbox";
  // Basic auth = base64(serverKey + ":"). Hitting a non-existent order returns
  // 404 when the key is valid, 401 when it isn't — so 401/403 => failed.
  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
  try {
    const res = await timedFetch(
      `${apiBase}/v2/nla-integration-probe/status`,
      { method: "GET", headers: { Authorization: authHeader, Accept: "application/json" } },
    );
    if (res.status === 401 || res.status === 403) {
      return { ...base, state: "failed", detail: `${detail} · kredensial ditolak` };
    }
    return { ...base, state: "connected", detail };
  } catch {
    return { ...base, state: "failed", detail: `${detail} · tidak terjangkau` };
  }
}

// ---- Resend (Email) ---------------------------------------------------------

async function checkResend(): Promise<IntegrationCheck> {
  const base = {
    id: "resend",
    label: "Resend (Email)",
    description: "Pengiriman email transaksional (verifikasi, notifikasi).",
  };
  const apiKey = optionalEnv("RESEND_API_KEY");
  if (!apiKey) return { ...base, state: "not_configured" };
  try {
    const res = await timedFetch("https://api.resend.com/api-keys", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (res.ok) return { ...base, state: "connected" };
    return { ...base, state: "failed", detail: `HTTP ${res.status}` };
  } catch {
    return { ...base, state: "failed", detail: "Tidak terjangkau" };
  }
}

// ---- Bunny Stream (Video) ---------------------------------------------------

async function checkBunnyStream(): Promise<IntegrationCheck> {
  const base = {
    id: "bunny_stream",
    label: "Bunny Stream (Video)",
    description: "Hosting & streaming video pembelajaran.",
  };
  const libId = optionalEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = optionalEnv("BUNNY_STREAM_API_KEY");
  if (!libId || !apiKey) return { ...base, state: "not_configured" };
  try {
    const res = await timedFetch(
      `https://video.bunnycdn.com/library/${libId}/videos?page=1&itemsPerPage=1`,
      { method: "GET", headers: { AccessKey: apiKey, Accept: "application/json" } },
    );
    if (res.ok) return { ...base, state: "connected" };
    return { ...base, state: "failed", detail: `HTTP ${res.status}` };
  } catch {
    return { ...base, state: "failed", detail: "Tidak terjangkau" };
  }
}

// ---- Bunny Storage (File) ---------------------------------------------------

async function checkBunnyStorage(): Promise<IntegrationCheck> {
  const base = {
    id: "bunny_storage",
    label: "Bunny Storage (File)",
    description: "Penyimpanan berkas tugas, lampiran, dan thumbnail.",
  };
  const zone = optionalEnv("BUNNY_STORAGE_ZONE_NAME");
  const accessKey = optionalEnv("BUNNY_STORAGE_ACCESS_KEY");
  if (!zone || !accessKey) return { ...base, state: "not_configured" };
  const region = optionalEnv("BUNNY_STORAGE_REGION");
  const endpoint = region ? `${region}.storage.bunnycdn.com` : "storage.bunnycdn.com";
  try {
    const res = await timedFetch(`https://${endpoint}/${zone}/`, {
      method: "GET",
      headers: { AccessKey: accessKey, Accept: "application/json" },
    });
    if (res.ok) return { ...base, state: "connected" };
    return { ...base, state: "failed", detail: `HTTP ${res.status}` };
  } catch {
    return { ...base, state: "failed", detail: "Tidak terjangkau" };
  }
}

// ---- Better Auth secret (presence only) -------------------------------------

function checkAuthSecret(): IntegrationCheck {
  const base = {
    id: "better_auth",
    label: "Better Auth (Sesi)",
    description: "Kunci penandatangan sesi & autentikasi.",
  };
  const secret = optionalEnv("BETTER_AUTH_SECRET");
  // A signing secret can't be "pinged"; presence is the only signal.
  return secret
    ? { ...base, state: "connected", detail: "Terpasang" }
    : { ...base, state: "not_configured" };
}

/** Run every probe in parallel; a thrown probe degrades to `failed`. */
export async function checkIntegrations(): Promise<IntegrationCheck[]> {
  const probes: Promise<IntegrationCheck>[] = [
    checkDatabase(),
    checkMidtrans(),
    checkResend(),
    checkBunnyStream(),
    checkBunnyStorage(),
    Promise.resolve(checkAuthSecret()),
  ];
  const settled = await Promise.allSettled(probes);
  return settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: `probe_${i}`,
          label: "Layanan",
          description: "Pemeriksaan gagal.",
          state: "failed" as const,
        },
  );
}
