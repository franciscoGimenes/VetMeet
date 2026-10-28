import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaLayout } from "@/components/BuscaLayout";
import { EsqueletoBusca } from "@/components/Esqueletos";
import { ListaResultados } from "@/components/Resultados";
import { getCatalogos } from "@/lib/catalogos";
import { filtrosParaParams, parseFiltros } from "@/lib/filtros";

export const metadata: Metadata = { title: "Buscar veterinários" };

type Params = Record<string, string | string[] | undefined>;

export default function PaginaBusca({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<EsqueletoBusca />}>
      <Busca searchParams={searchParams} />
    </Suspense>
  );
}

async function Busca({ searchParams }: { searchParams: Promise<Params> }) {
  const [params, catalogos] = await Promise.all([searchParams, getCatalogos()]);
  const filtros = parseFiltros(params, catalogos);
  const pagina = Math.max(1, Math.floor(Number(params.pagina)) || 1);

  return (
    <div className="pt-4 lg:pt-8">
      <h1 className="sr-only">Buscar veterinários</h1>
      <BuscaLayout key={filtrosParaParams(filtros).toString()} catalogos={catalogos} filtros={filtros}>
        <ListaResultados catalogos={catalogos} filtros={filtros} pagina={pagina} />
      </BuscaLayout>
    </div>
  );
}
