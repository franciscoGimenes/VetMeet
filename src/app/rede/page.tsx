import { PenSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EsqueletoRede } from "@/components/Esqueletos";
import { FeedRede } from "@/components/rede/FeedRede";
import { FiltrosRede } from "@/components/rede/FiltrosRede";
import { RedeProvider } from "@/components/rede/RedeContexto";
import { ButtonLink, chipClasses, Icon } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import { listarPosts } from "@/lib/posts";
import {
  CATEGORIAS,
  contarFiltrosPainel,
  nomeCategoria,
  paramsRede,
  parseFiltrosRede,
  urlRede,
  type FiltrosRede as Filtros,
} from "@/lib/rede";
import { curtidosPor, getVisitante } from "@/lib/visitante";

type Params = Record<string, string | string[] | undefined>;

const DESCRICAO =
  "Dicas para tutores, relatos de caso e bastidores de veterinários do Alto Tietê e da Zona Leste de São Paulo.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const [params, catalogos] = await Promise.all([searchParams, getCatalogos()]);
  const f = parseFiltrosRede(params, catalogos);
  const titulo = f.categoria ? `${nomeCategoria(f.categoria)} na Rede VetMeet` : "Rede: o dia a dia de veterinários";
  return {
    title: titulo,
    description: DESCRICAO,
    // Só a Rede inteira e cada categoria são indexáveis; os demais filtros não.
    alternates: { canonical: urlRede({ categoria: f.categoria, local: [] }) },
    robots: contarFiltrosPainel(f) > 0 ? { index: false, follow: true } : undefined,
    openGraph: { title: titulo, description: DESCRICAO, url: urlRede({ categoria: f.categoria, local: [] }) },
  };
}

export default function PaginaRede({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<EsqueletoRede />}>
      <Rede searchParams={searchParams} />
    </Suspense>
  );
}

async function Rede({ searchParams }: { searchParams: Promise<Params> }) {
  const [params, catalogos, visitante] = await Promise.all([searchParams, getCatalogos(), getVisitante()]);
  const filtros = parseFiltrosRede(params, catalogos);
  const chave = paramsRede(filtros).toString();
  const pagina = await listarPosts(filtros, null);
  const curtidos = await curtidosPor(visitante, pagina.posts.map((p) => p.id));

  return (
    <RedeProvider visitante={visitante}>
      <div className="pb-16">
        <div className="bg-sage-100">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 pt-6 pb-6 sm:px-6 lg:pt-10 lg:pb-8">
            <div className="max-w-2xl">
              <h1 className="text-h1 text-text">Rede</h1>
              <p className="mt-2 text-body text-text">{DESCRICAO}</p>
            </div>
            <ButtonLink href="/rede/novo">
              <Icon icon={PenSquare} />
              Publicar
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6 lg:mt-8 lg:grid lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-8">
          {/* Celular: botão "Filtros" acima do feed. Desktop: barra lateral. */}
          <div className="mb-4 lg:mb-0">
            <FiltrosRede catalogos={catalogos} filtros={filtros} chave={chave} />
          </div>
          <div className="max-w-2xl min-w-0">
            <Categorias filtros={filtros} />
            <div className="mt-4 md:mt-6">
              <FeedRede
                key={chave}
                posts={pagina.posts}
                proximo={pagina.proximo}
                curtidos={curtidos}
                filtros={filtros}
                vazio={<Vazio filtros={filtros} />}
              />
            </div>
          </div>
        </div>
      </div>
    </RedeProvider>
  );
}

// Chips de categoria: links (a categoria muda a URL e mantém os outros filtros).
function Categorias({ filtros }: { filtros: Filtros }) {
  return (
    <nav aria-label="Categorias" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 sm:flex-wrap">
        {[{ valor: undefined, nome: "Todas" }, ...CATEGORIAS].map((c) => {
          const ativo = filtros.categoria === c.valor;
          return (
            <li key={c.nome} className="shrink-0">
              <Link
                href={urlRede({ ...filtros, categoria: c.valor })}
                aria-current={ativo ? "page" : undefined}
                className={chipClasses({ selected: ativo })}
              >
                {c.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Vazio({ filtros }: { filtros: Filtros }) {
  const filtrado = Boolean(filtros.categoria) || contarFiltrosPainel(filtros) > 0;
  return (
    <div className="rounded-card bg-sage-100 p-6 text-center">
      <p className="text-h3 text-text">{filtrado ? "Nenhuma publicação com esses filtros" : "Nenhuma publicação ainda"}</p>
      <p className="mt-2 text-body text-text-muted">
        {filtrado ? "Tente outra categoria ou tire algum filtro." : "Seja o primeiro veterinário a publicar."}
      </p>
      <div className="mt-4">
        {filtrado ? (
          <ButtonLink href="/rede" variant="secondary">
            Ver todas as publicações
          </ButtonLink>
        ) : (
          <ButtonLink href="/rede/novo">Publicar</ButtonLink>
        )}
      </div>
    </div>
  );
}
