import { X } from "lucide-react";
import Link from "next/link";
import { CardVeterinario, type ContextoBusca } from "@/components/CardVeterinario";
import { ButtonLink, Card, Icon, chipClasses } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { FILTROS_VAZIOS, filtrosAtivos, urlBusca, type Filtros } from "@/lib/filtros";
import { buscarVeterinarios, contarVeterinarios, POR_PAGINA } from "@/lib/veterinarios";
import { listaNatural } from "@/lib/formato";
import { VIZINHOS } from "@/lib/vizinhos";

// "Suzano", "Centro e Jundiapeba, Mogi das Cruzes", "Poá, Suzano e Arujá", "5 cidades".
export function nomeLocal(f: Filtros, cat: Catalogos) {
  const regioes = f.local.map((l) => cat.regioes.find((r) => r.slug === l)).filter((r) => r !== undefined);
  if (!regioes.length) return undefined;
  if (regioes.length > 3) return `${regioes.length} cidades`;
  if (regioes.length > 1) return listaNatural(regioes.map((r) => r.nome));
  const [regiao] = regioes;
  const bairros = f.bairro
    .filter((b) => b.startsWith(`${regiao.slug}.`))
    .map((b) => cat.bairros.find((x) => x.region_id === regiao.id && x.slug === b.split(".")[1])?.nome)
    .filter((n): n is string => Boolean(n) && n !== regiao.nome);
  return bairros.length ? `${listaNatural(bairros)}, ${regiao.nome}` : regiao.nome;
}

const plural = (n: number) => (n === 1 ? "1 profissional" : `${n} profissionais`);

export async function ListaResultados({
  catalogos,
  filtros,
  pagina,
  titulo,
}: {
  catalogos: Catalogos;
  filtros: Filtros;
  pagina: number;
  titulo?: string;
}) {
  const { total, vets } = await buscarVeterinarios(filtros, pagina);
  const contexto: ContextoBusca = { filtros, localNome: nomeLocal(filtros, catalogos) };
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-h3 text-text">
          {titulo ?? (total === 1 ? "1 veterinário encontrado" : `${total} veterinários encontrados`)}
        </h2>
        {(filtros.q || contexto.localNome) && (
          <p className="text-small text-text-muted">
            {filtros.q && <>para “{filtros.q}”</>}
            {filtros.q && contexto.localNome && " "}
            {contexto.localNome && <>em {contexto.localNome}</>}
          </p>
        )}
      </div>

      <FiltrosAtivos filtros={filtros} catalogos={catalogos} />

      {total === 0 ? (
        <EstadoVazio filtros={filtros} catalogos={catalogos} />
      ) : vets.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong p-4 text-center sm:p-6">
          <p className="text-body text-text">Esta página não existe.</p>
          <ButtonLink href={urlBusca(filtros)} variant="secondary" className="mt-4">
            Voltar para a primeira página
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vets.map((vet) => (
              <li key={vet.id} className="grid">
                <CardVeterinario vet={vet} contexto={contexto} />
              </li>
            ))}
          </ul>
          {totalPaginas > 1 && <Paginacao filtros={filtros} pagina={pagina} totalPaginas={totalPaginas} />}
        </>
      )}
    </div>
  );
}

function FiltrosAtivos({ filtros, catalogos }: { filtros: Filtros; catalogos: Catalogos }) {
  const ativos = filtrosAtivos(filtros, catalogos);
  if (!ativos.length) return null;
  return (
    <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
      {ativos.map((a) => (
        <li key={a.chave}>
          <Link href={urlBusca(a.sem)} className={chipClasses({ selected: true })}>
            {a.rotulo}
            <Icon icon={X} size="sm" label="remover" />
          </Link>
        </li>
      ))}
      {ativos.length > 1 && (
        <li>
          <ButtonLink href="/buscar" variant="ghost">
            Limpar tudo
          </ButtonLink>
        </li>
      )}
    </ul>
  );
}

function Paginacao({ filtros, pagina, totalPaginas }: { filtros: Filtros; pagina: number; totalPaginas: number }) {
  const href = (p: number) => urlBusca(filtros, p > 1 ? { pagina: String(p) } : undefined);
  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <ButtonLink href={href(pagina - 1)} variant="secondary" rel="prev">
          Anterior
        </ButtonLink>
      ) : (
        <span />
      )}
      <p className="text-small text-text-muted">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <ButtonLink href={href(pagina + 1)} variant="secondary" rel="next">
          Próxima
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}

// Sugere caminhos concretos: quais filtros afrouxar e quais regiões próximas
// têm resultado, sempre com a contagem real.
async function EstadoVazio({ filtros, catalogos }: { filtros: Filtros; catalogos: Catalogos }) {
  if (filtros.q) return <NomeNaoEncontrado filtros={filtros} catalogos={catalogos} q={filtros.q} />;

  const afrouxar = filtrosAtivos(filtros, catalogos).filter((a) => !a.chave.startsWith("local:"));
  // Regiões vizinhas das escolhidas, que ainda não estão na busca.
  const vizinhos = [...new Set(filtros.local.flatMap((l) => VIZINHOS[l] ?? []))].filter(
    (v) => !filtros.local.includes(v),
  );

  const [semFiltro, porVizinho, todaRegiao] = await Promise.all([
    Promise.all(afrouxar.map(async (a) => ({ ...a, total: await contarVeterinarios(a.sem) }))),
    Promise.all(
      vizinhos.map(async (slug) => {
        const f = { ...filtros, local: [...filtros.local, slug] };
        return { slug, filtros: f, total: await contarVeterinarios(f) };
      }),
    ),
    filtros.local.length ? contarVeterinarios({ ...filtros, local: [], bairro: [] }) : 0,
  ]);

  const sugestoesFiltro = semFiltro.filter((s) => s.total > 0).sort((a, b) => b.total - a.total).slice(0, 4);
  const sugestoesVizinhos = porVizinho.filter((v) => v.total > 0).sort((a, b) => b.total - a.total);
  const nomeRegiao = (slug: string) => catalogos.regioes.find((r) => r.slug === slug)?.nome ?? slug;

  return (
    <Card padding="lg">
      <h3 className="text-h3 text-text">Nenhum profissional com todos esses filtros</h3>
      <p className="mt-1 text-small text-text-muted">Tente uma destas alternativas:</p>

      {sugestoesFiltro.length > 0 && (
        <div className="mt-6">
          <h4 className="text-small font-semibold text-text">Afrouxar um filtro</h4>
          <ul className="mt-2 space-y-2">
            {sugestoesFiltro.map((s) => (
              <li key={s.chave}>
                <Link
                  href={urlBusca(s.sem)}
                  className="inline-flex min-h-11 items-center text-small text-primary underline hover:text-primary-hover"
                >
                  Sem “{s.rotulo}”: {plural(s.total)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sugestoesVizinhos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-small font-semibold text-text">Incluir regiões próximas</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {sugestoesVizinhos.map((v) => (
              <li key={v.slug}>
                <Link href={urlBusca(v.filtros)} className={chipClasses()}>
                  {nomeRegiao(v.slug)} ({v.total})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {filtros.local.length > 0 && todaRegiao > 0 && (
          <ButtonLink href={urlBusca({ ...filtros, local: [], bairro: [] })} variant="secondary">
            Buscar em toda a região ({todaRegiao})
          </ButtonLink>
        )}
        <ButtonLink href={urlBusca(FILTROS_VAZIOS)} variant="secondary">
          Limpar todos os filtros
        </ButtonLink>
      </div>
    </Card>
  );
}

// Busca por nome sem resultado: o caminho principal é tirar os outros filtros
// (o nome pode existir em outra cidade ou modalidade) ou revisar a grafia.
async function NomeNaoEncontrado({ filtros, catalogos, q }: { filtros: Filtros; catalogos: Catalogos; q: string }) {
  const outrosFiltros = filtrosAtivos(filtros, catalogos).filter((a) => a.chave !== "q");
  const soONome = { ...FILTROS_VAZIOS, q };
  const semONome = { ...filtros, q: undefined };

  const [totalSoONome, totalSemONome] = await Promise.all([
    outrosFiltros.length ? contarVeterinarios(soONome) : 0,
    contarVeterinarios(semONome),
  ]);

  return (
    <Card padding="lg">
      <h3 className="text-h3 text-text">
        Nenhum veterinário ou clínica com “{q}”{outrosFiltros.length > 0 && " nesses filtros"}
      </h3>

      {totalSoONome > 0 ? (
        <p className="mt-1 text-small text-text-muted">
          {totalSoONome === 1 ? "Há 1 resultado" : `Há ${totalSoONome} resultados`} com esse nome quando os
          outros filtros são removidos.
        </p>
      ) : (
        <p className="mt-1 text-small text-text-muted">
          Confira a grafia ou tente só uma parte do nome, como as primeiras letras.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {totalSoONome > 0 && (
          <ButtonLink href={urlBusca(soONome)}>
            Buscar “{q}” sem os outros filtros ({totalSoONome})
          </ButtonLink>
        )}
        {outrosFiltros.length > 0 && totalSemONome > 0 && (
          <ButtonLink href={urlBusca(semONome)} variant="secondary">
            Manter filtros e limpar o nome ({totalSemONome})
          </ButtonLink>
        )}
        <ButtonLink href={urlBusca(FILTROS_VAZIOS)} variant="secondary">
          Limpar todos os filtros
        </ButtonLink>
      </div>
    </Card>
  );
}
