import type { NextRequest } from "next/server";
import { getCatalogos } from "@/lib/catalogos";
import { parseFiltros } from "@/lib/filtros";
import { contarVeterinarios } from "@/lib/veterinarios";

// Quantos resultados uma combinação de filtros traria. Alimenta o "Ver X
// resultados" do sheet de filtros enquanto a pessoa ainda está escolhendo.
// Mesmo parser e mesma RPC da página de busca (com RLS: só perfis ativos).
export async function GET(request: NextRequest) {
  const params: Record<string, string[]> = {};
  for (const [k, v] of request.nextUrl.searchParams) (params[k] ??= []).push(v);

  const filtros = parseFiltros(params, await getCatalogos());
  const total = await contarVeterinarios(filtros);
  return Response.json({ total }, { headers: { "Cache-Control": "no-store" } });
}
