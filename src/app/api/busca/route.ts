import { getCatalogos } from "@/lib/catalogos";
import { registrarBusca } from "@/lib/eventos";
import { parseFiltros } from "@/lib/filtros";
import { contarVeterinarios } from "@/lib/veterinarios";

// Recebe a query string da busca exibida. Os filtros passam pelo mesmo parser
// da página (slugs fora do catálogo são descartados) e o total é recalculado
// aqui, então o cliente não consegue gravar valores arbitrários.
export async function POST(request: Request) {
  let consulta: unknown;
  try {
    ({ consulta } = await request.json());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof consulta !== "string" || consulta.length > 500) return new Response(null, { status: 400 });

  const params: Record<string, string[]> = {};
  for (const [k, v] of new URLSearchParams(consulta)) (params[k] ??= []).push(v);

  const filtros = parseFiltros(params, await getCatalogos());
  const total = await contarVeterinarios(filtros);
  await registrarBusca(filtros, total, request.headers.get("user-agent"));
  return new Response(null, { status: 204 });
}
