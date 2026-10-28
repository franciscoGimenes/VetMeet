import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Client com a service role: ignora RLS. Só para código de servidor que já
// validou a entrada (ex.: Server Action do pré-cadastro). Nunca importe em
// componentes de cliente; o "server-only" acima faz o build falhar se isso
// acontecer.
export function createAdminClient() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida (veja .env.example).");
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
