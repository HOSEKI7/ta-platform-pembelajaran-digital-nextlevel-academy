import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";

/**
 * Browser-side Better Auth client. Use this from Client Components for
 * sign-in / sign-up / sign-out / password reset flows. Reads the same
 * NEXT_PUBLIC_APP_URL the server uses.
 *
 * `inferAdditionalFields<typeof auth>()` makes the custom user fields
 * (`role`, `username`, `bio`, `isActive`) visible on `session.user` with
 * full TS types — no extra fetches required.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
} = authClient;
