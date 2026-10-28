import { Suspense } from "react";
import { BuscaLayout } from "@/components/BuscaLayout";
import { EsqueletoBusca } from "@/components/Esqueletos";
import { ListaResultados } from "@/components/Resultados";
import { getCatalogos } from "@/lib/catalogos";
import { FILTROS_VAZIOS } from "@/lib/filtros";

export default function Inicio() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-5 sm:px-6 sm:pt-12 sm:pb-8">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
          Encontre um veterinário perto de você
        </h1>
        <p className="mt-3 max-w-2xl text-base text-pretty text-slate-600 sm:text-lg">
          Clínicas, atendimento em casa e teleorientação no Alto Tietê e na Zona Leste de São Paulo.
        </p>
      </section>
      <Suspense fallback={<EsqueletoBusca />}>
        <BuscaInicial />
      </Suspense>
    </>
  );
}

async function BuscaInicial() {
  const catalogos = await getCatalogos();
  return (
    <BuscaLayout catalogos={catalogos} filtros={FILTROS_VAZIOS}>
      <ListaResultados
        catalogos={catalogos}
        filtros={FILTROS_VAZIOS}
        pagina={1}
        titulo="Profissionais na região"
      />
    </BuscaLayout>
  );
}
