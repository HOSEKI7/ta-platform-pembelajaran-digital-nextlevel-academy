/**
 * Verify connectivity to the configured Bunny.net account (Storage + Stream).
 *
 * Run with:  npm run verify:bunny
 *
 * Mirrors the production code paths but is fully self-contained: the real
 * helpers in `src/lib/bunny-storage.ts` / `bunny.ts` are `server-only` and
 * throw when imported in a plain Node/tsx process, so the small amount of
 * signing/PUT logic is re-implemented here (reading the same env vars).
 *
 * STORAGE test (end-to-end): PUT a tiny health-check file -> GET it back via a
 *   signed Pull-Zone URL (assert 200 + body match) -> DELETE. Validates
 *   ZONE_NAME + ACCESS_KEY + REGION (upload) and PULL_ZONE + TOKEN_AUTH_KEY
 *   (signed download) together.
 * STREAM test: list videos via the Bunny Stream API. Validates LIBRARY_ID +
 *   API_KEY and reports how many videos exist in the (new) library.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createHash } from "node:crypto";

// ---- env --------------------------------------------------------------------
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME ?? "";
const STORAGE_ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY ?? "";
const STORAGE_REGION = process.env.BUNNY_STORAGE_REGION ?? "";
const STORAGE_PULL_ZONE = process.env.BUNNY_STORAGE_PULL_ZONE ?? "";
const STORAGE_TOKEN_KEY = process.env.BUNNY_STORAGE_TOKEN_AUTH_KEY ?? "";

const STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY ?? "";
const STREAM_TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY ?? "";

// ---- tiny console helpers ---------------------------------------------------
const pass = (msg: string) => console.log(`  \x1b[32mPASS\x1b[0m  ${msg}`);
const fail = (msg: string) => console.log(`  \x1b[31mFAIL\x1b[0m  ${msg}`);
const info = (msg: string) => console.log(`  ·     ${msg}`);

function storageEndpoint(): string {
  return STORAGE_REGION ? `${STORAGE_REGION}.storage.bunnycdn.com` : "storage.bunnycdn.com";
}

function signPullZoneUrl(objectPath: string, expiresInSec = 300): string {
  const cleanPath = objectPath.startsWith("/") ? objectPath : `/${objectPath}`;
  const baseUrl = `https://${STORAGE_PULL_ZONE}${cleanPath}`;
  if (!STORAGE_TOKEN_KEY) return baseUrl; // token auth disabled on pull zone
  const expires = Math.floor(Date.now() / 1000) + expiresInSec;
  const token = createHash("sha256")
    .update(`${STORAGE_TOKEN_KEY}${cleanPath}${expires}`)
    .digest("base64url");
  return `${baseUrl}?token=${token}&expires=${expires}`;
}

async function testStorage(): Promise<boolean> {
  console.log("\n== Bunny Storage ==");
  if (!STORAGE_ZONE || !STORAGE_ACCESS_KEY) {
    fail("BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_ACCESS_KEY belum diisi.");
    return false;
  }
  if (!STORAGE_PULL_ZONE) {
    fail("BUNNY_STORAGE_PULL_ZONE belum diisi (tidak bisa tes download bertoken).");
    return false;
  }
  info(`Zone: ${STORAGE_ZONE}  Region: ${STORAGE_REGION || "(default/de)"}  PullZone: ${STORAGE_PULL_ZONE}`);
  info(`Token auth pada pull zone: ${STORAGE_TOKEN_KEY ? "AKTIF (URL ditandatangani)" : "tidak diset (URL polos)"}`);

  const objectPath = `_healthcheck/${Date.now()}.txt`;
  const marker = `nla-bunny-healthcheck-${Date.now()}`;
  const uploadUrl = `https://${storageEndpoint()}/${STORAGE_ZONE}/${objectPath}`;

  // 1) PUT
  let putOk = false;
  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { AccessKey: STORAGE_ACCESS_KEY, "Content-Type": "text/plain" },
      body: marker,
    });
    if (res.ok) {
      pass(`Upload (PUT) berhasil → ${objectPath} [${res.status}]`);
      putOk = true;
    } else {
      const hint =
        res.status === 401
          ? " → BUNNY_STORAGE_ACCESS_KEY salah."
          : res.status === 404
            ? " → Storage zone tidak ditemukan: cek BUNNY_STORAGE_ZONE_NAME & BUNNY_STORAGE_REGION."
            : "";
      fail(`Upload (PUT) gagal [${res.status} ${res.statusText}]${hint}`);
    }
  } catch (err) {
    fail(`Upload (PUT) error koneksi: ${(err as Error).message} (cek BUNNY_STORAGE_REGION/host).`);
  }
  if (!putOk) return false;

  // 2) GET via signed pull-zone URL
  let getOk = false;
  try {
    const signed = signPullZoneUrl(objectPath);
    const res = await fetch(signed, { cache: "no-store" });
    const body = res.ok ? await res.text() : "";
    if (res.ok && body.trim() === marker) {
      pass(`Download via signed Pull-Zone URL cocok [${res.status}]`);
      getOk = true;
    } else if (res.ok) {
      fail(`Download 200 tapi isi tidak cocok (propagasi CDN? coba ulang).`);
    } else {
      const hint =
        res.status === 401 || res.status === 403
          ? " → Token auth: BUNNY_STORAGE_TOKEN_AUTH_KEY tidak cocok dengan key di Pull Zone, atau token auth belum diaktifkan/dikonfigurasi benar."
          : res.status === 404
            ? " → Hostname Pull Zone salah (cek BUNNY_STORAGE_PULL_ZONE — hostname *.b-cdn.net unik global) atau file belum ter-propagasi."
            : "";
      fail(`Download gagal [${res.status} ${res.statusText}]${hint}`);
    }
  } catch (err) {
    fail(`Download error koneksi: ${(err as Error).message}`);
  }

  // 3) DELETE (cleanup — best effort)
  try {
    const res = await fetch(uploadUrl, {
      method: "DELETE",
      headers: { AccessKey: STORAGE_ACCESS_KEY },
    });
    if (res.ok) pass(`Cleanup (DELETE) berhasil [${res.status}]`);
    else info(`Cleanup (DELETE) [${res.status}] — file uji mungkin perlu dihapus manual: ${objectPath}`);
  } catch (err) {
    info(`Cleanup (DELETE) error: ${(err as Error).message}`);
  }

  return getOk;
}

type StreamVideoListResponse = {
  totalItems?: number;
  items?: { guid: string; title: string }[];
};

async function testStream(): Promise<boolean> {
  console.log("\n== Bunny Stream ==");
  if (!STREAM_LIBRARY_ID) {
    fail("BUNNY_STREAM_LIBRARY_ID belum diisi.");
    return false;
  }
  info(`Library ID: ${STREAM_LIBRARY_ID}`);
  info(`Token auth playback: ${STREAM_TOKEN_KEY ? "AKTIF (URL ditandatangani)" : "tidak diset (URL polos)"}`);
  if (!STREAM_API_KEY) {
    fail("BUNNY_STREAM_API_KEY kosong — tidak bisa cek library via API (var ini tak dipakai app, tapi diperlukan tes ini).");
    return false;
  }

  const url = `https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}/videos?page=1&itemsPerPage=5`;
  try {
    const res = await fetch(url, {
      headers: { AccessKey: STREAM_API_KEY, accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      const hint =
        res.status === 401
          ? " → BUNNY_STREAM_API_KEY salah untuk library ini."
          : res.status === 404
            ? " → Library ID tidak ditemukan di akun ini (cek BUNNY_STREAM_LIBRARY_ID)."
            : "";
      fail(`Stream API gagal [${res.status} ${res.statusText}]${hint}`);
      return false;
    }
    const data = (await res.json()) as StreamVideoListResponse;
    const total = data.totalItems ?? data.items?.length ?? 0;
    pass(`Library terjangkau via API [200] — total video: ${total}`);
    if (total === 0) {
      info("Library KOSONG → video kursus lama (GUID di DB) tidak akan main sampai di-upload ulang & GUID di-seed.");
    } else if (data.items?.length) {
      info("Contoh GUID di library:");
      for (const v of data.items) info(`   ${v.guid}  ${v.title || "(tanpa judul)"}`);
    }
    return true;
  } catch (err) {
    fail(`Stream API error koneksi: ${(err as Error).message}`);
    return false;
  }
}

async function main() {
  console.log("Verifikasi koneksi Bunny.net (membaca .env.local)…");
  const storageOk = await testStorage();
  const streamOk = await testStream();

  console.log("\n== Ringkasan ==");
  console.log(`  Storage : ${storageOk ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}`);
  console.log(`  Stream  : ${streamOk ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}`);
  console.log("");

  if (!storageOk || !streamOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
