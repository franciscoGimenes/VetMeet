import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database";

// Registro de cliques de contato. Sem dados pessoais do tutor: só o
// profissional, o canal, a origem e os filtros da busca.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CANAIS = ["whatsapp", "instagram", "maps"] as const;
const ORIGENS = ["card", "perfil"] as const;
const CHAVES_FILTRO = ["local", "bairro", "especie", "area", "servico", "modo", "pagamento", "disp", "preco"];

const textoCurto = (v: unknown): v is string => typeof v === "string" && v.length <= 60;

function limparFiltros(bruto: unknown): Record<string, Json> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};
  const limpo: Record<string, Json> = {};
  for (const chave of CHAVES_FILTRO) {
    const v = (bruto as Record<string, unknown>)[chave];
    if (textoCurto(v)) limpo[chave] = v;
    else if (typeof v === "number" && Number.isFinite(v)) limpo[chave] = v;
    else if (Array.isArray(v) && v.length <= 10 && v.every(textoCurto)) limpo[chave] = v;
  }
  return limpo;
}

export async function POST(request: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { veterinarian_id, canal, origem, filtros } = corpo ?? {};
  if (
    typeof veterinarian_id !== "string" ||
    !UUID.test(veterinarian_id) ||
    !CANAIS.includes(canal as (typeof CANAIS)[number]) ||
    !ORIGENS.includes(origem as (typeof ORIGENS)[number])
  ) {
    return new Response(null, { status: 400 });
  }

  // vet_slug / vet_is_demo são preenchidos pelo trigger no banco.
  const { error } = await createPublicClient()
    .from("contact_events")
    .insert({
      veterinarian_id,
      canal: canal as (typeof CANAIS)[number],
      origem: origem as (typeof ORIGENS)[number],
      filtros_usados: limparFiltros(filtros),
    });

  if (error) {
    console.error("contact_events:", error.message);
    return new Response(null, { status: 422 });
  }
  return new Response(null, { status: 204 });
}
