import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Server-only Supabase client wired with the service-role key. Used for
 * privileged storage operations (uploading avatars, signed URLs, etc.) where
 * the request has already been authenticated by Better Auth.
 *
 * Never import this from a client component — the service-role key would
 * leak. Storage buckets accessed by `getPublicUrl` should be marked public in
 * the Supabase dashboard.
 */
const globalForSupabase = globalThis as unknown as {
  __nlaSupabaseAdmin?: SupabaseClient;
};

export function getSupabaseAdmin(): SupabaseClient {
  if (!globalForSupabase.__nlaSupabaseAdmin) {
    globalForSupabase.__nlaSupabaseAdmin = createClient(
      env.supabase.url(),
      env.supabase.serviceRoleKey(),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
  return globalForSupabase.__nlaSupabaseAdmin;
}
