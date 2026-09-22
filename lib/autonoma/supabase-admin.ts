import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAutonomaSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Autonoma requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function throwIfError(error: { message: string } | null, operation: string): asserts error is null {
  if (error) {
    throw new Error(`${operation}: ${error.message}`);
  }
}
