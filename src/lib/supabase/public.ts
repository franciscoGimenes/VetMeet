import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Client sem cookies para leituras públicas (sujeitas ao RLS de anon).
// Pode ser usado dentro de funções com 'use cache'.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
