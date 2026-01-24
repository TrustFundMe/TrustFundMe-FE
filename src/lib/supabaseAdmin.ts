import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin client - SERVER-SIDE ONLY (API routes, server components).
 * Uses Service Role Key to bypass RLS (e.g. for Storage upload when using BE auth).
 * NEVER import this in client components.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SHARED_SUPABASE_KEY;

export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
