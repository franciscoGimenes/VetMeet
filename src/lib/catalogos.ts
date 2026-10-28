import { cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type ItemCatalogo = { id: number; slug: string; nome: string };
export type Regiao = ItemCatalogo & {
  tipo: "municipio" | "subprefeitura";
  regiao_macro: "alto_tiete" | "zona_leste_sp";
};
export type Bairro = ItemCatalogo & { region_id: number };

export type Catalogos = {
  regioes: Regiao[];
  bairros: Bairro[];
  especies: ItemCatalogo[];
  areas: ItemCatalogo[];
  servicos: ItemCatalogo[];
  modos: ItemCatalogo[];
  pagamentos: ItemCatalogo[];
};

export async function getCatalogos(): Promise<Catalogos> {
  "use cache";
  cacheLife("hours");

  const supabase = createPublicClient();
  const [regioes, bairros, especies, areas, servicos, modos, pagamentos] =
    await Promise.all([
      supabase.from("regions").select("id, slug, nome, tipo, regiao_macro").order("nome"),
      supabase.from("neighborhoods").select("id, slug, nome, region_id").order("nome"),
      supabase.from("species").select("id, slug, nome").order("ordem"),
      supabase.from("specialties").select("id, slug, nome").order("ordem"),
      supabase.from("services").select("id, slug, nome").order("ordem"),
      supabase.from("attendance_modes").select("id, slug, nome").order("ordem"),
      supabase.from("payment_methods").select("id, slug, nome").order("ordem"),
    ]);

  const erro = [regioes, bairros, especies, areas, servicos, modos, pagamentos].find((r) => r.error);
  if (erro?.error) throw new Error(`Falha ao carregar catálogos: ${erro.error.message}`);

  return {
    regioes: regioes.data!,
    bairros: bairros.data!,
    especies: especies.data!,
    areas: areas.data!,
    servicos: servicos.data!,
    modos: modos.data!,
    pagamentos: pagamentos.data!,
  };
}
