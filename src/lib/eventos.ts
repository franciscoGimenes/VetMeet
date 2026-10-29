import "server-only";
import { filtrosParaLog, type Filtros } from "@/lib/filtros";
import { createAdminClient } from "@/lib/supabase/admin";

const ROBO = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;

// Registra uma busca (só filtros e total, nada do visitante). Best-effort:
// qualquer falha é ignorada para nunca afetar a página.
export async function registrarBusca(filtros: Filtros, total: number, userAgent: string | null) {
  if (!userAgent || ROBO.test(userAgent)) return;
  try {
    const { error } = await createAdminClient()
      .from("search_events")
      .insert({ filtros: filtrosParaLog(filtros), local: filtros.local.length ? filtros.local : null, total });
    if (error) console.error("search_events:", error.message);
  } catch (erro) {
    console.error("search_events:", erro);
  }
}
