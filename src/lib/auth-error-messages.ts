/**
 * Maps Better Auth error codes to Bahasa Indonesia messages.
 *
 * Better Auth surfaces `error.message` in English ("Invalid email or
 * password", …). Forms used to fall back to an Indonesian string only when
 * `error.message` was absent — which it never is — so the English copy always
 * leaked into the toast. Translating by the stable `error.code` instead keeps
 * the UI consistently Indonesian. Recommended pattern from Better Auth docs
 * (the client `$ERROR_CODES` / `getErrorMessage(code, lang)` approach).
 */
type AuthLikeError = { code?: string | null; message?: string | null } | null | undefined;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email atau password salah.",
  INVALID_PASSWORD: "Password salah.",
  USER_NOT_FOUND: "Akun dengan email ini tidak ditemukan.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Akun dengan email ini tidak ditemukan.",
  EMAIL_NOT_VERIFIED: "Email kamu belum diverifikasi.",
  USER_ALREADY_EXISTS: "Email ini sudah terdaftar.",
  SESSION_EXPIRED: "Sesi kamu telah berakhir. Silakan masuk lagi.",
  TOO_MANY_REQUESTS: "Terlalu banyak percobaan. Coba lagi beberapa saat.",
};

/**
 * Resolve an Indonesian message for a Better Auth error. Known `error.code`s
 * map to a curated string; anything unknown returns the provided Indonesian
 * `fallback` — the raw English `error.message` is intentionally never shown.
 */
export function authErrorMessage(error: AuthLikeError, fallback: string): string {
  const code = error?.code;
  if (code && code in AUTH_ERROR_MESSAGES) return AUTH_ERROR_MESSAGES[code];
  return fallback;
}
