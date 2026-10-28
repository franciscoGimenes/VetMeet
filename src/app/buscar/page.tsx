import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaLayout } from "@/components/BuscaLayout";
import { EsqueletoBusca } from "@/components/Esqueletos";
import { RegistroBusca } from "@/components/RegistroBusca";
import { ListaResultados } from "@/components/Resultados";
import { getCatalogos } from "@/lib/catalogos";
import { filtrosParaParams, parseFiltros } from "@/lib/filtros";
import { buscaIndexavel, canonicalBusca, tituloBusca } from "@/lib/seo";

type Params = Record<string, string | string[] | undefined>;

const paginaDe = (params: Params) => Math.max(1, Math.floor(Number(params.pagina)) || 1);

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const [params, catalogos] = await Promise.all([searchParams, getCatalogos()]);
  const filtros = parseFiltros(params, catalogos);
  const titulo = tituloBusca(filtros, catalogos);
  const descricao = `${titulo}: compare profissionais com clínica própria, atendimento em casa ou teleorientação, veja preços e fale direto pelo WhatsApp.`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: canonicalBusca(filtros) },
    robots: buscaIndexavel(filtros, paginaDe(params)) ? undefined : { index: false, follow: true },
    openGraph: { title: titulo, description: descricao, url: canonicalBusca(filtros) },
  };
}

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
  const pagina = paginaDe(params);
  const consulta = filtrosParaParams(filtros).toString();

  return (
    <div className="pt-4 lg:pt-8">
      <h1 className="sr-only">{tituloBusca(filtros, catalogos)}</h1>
      {/* Só a página 1 conta: paginar não é uma busca nova. */}
      {pagina === 1 && <RegistroBusca consulta={consulta} />}
      <BuscaLayout chave={consulta} catalogos={catalogos} filtros={filtros}>
        <ListaResultados catalogos={catalogos} filtros={filtros} pagina={pagina} />
      </BuscaLayout>
    </div>
  );
}
