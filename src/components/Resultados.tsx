import Link from "next/link";
import { CardVeterinario, type ContextoBusca } from "@/components/CardVeterinario";
import { BOTAO_SECUNDARIO } from "@/components/estilos";
import { IconeFechar } from "@/components/icones";
import type { Catalogos } from "@/lib/catalogos";
import { FILTROS_VAZIOS, filtrosAtivos, urlBusca, type Filtros } from "@/lib/filtros";
import { buscarVeterinarios, contarVeterinarios, POR_PAGINA } from "@/lib/veterinarios";
import { VIZINHOS } from "@/lib/vizinhos";

export function nomeLocal(f: Filtros, cat: Catalogos) {
  const regiao = cat.regioes.find((r) => r.slug === f.local);
  if (!regiao) return undefined;
  const bairro = cat.bairros.find((b) => b.region_id === regiao.id && b.slug === f.bairro);
  return bairro && bairro.nome !== regiao.nome ? `${bairro.nome}, ${regiao.nome}` : regiao.nome;
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
        <h2 className="text-lg font-semibold text-slate-900">
          {titulo ?? (total === 1 ? "1 veterinário encontrado" : `${total} veterinários encontrados`)}
        </h2>
        {contexto.localNome && <p className="text-sm text-slate-600">em {contexto.localNome}</p>}
      </div>

      <FiltrosAtivos filtros={filtros} catalogos={catalogos} />

      {total === 0 ? (
        <EstadoVazio filtros={filtros} catalogos={catalogos} />
      ) : vets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-700">Esta página não existe.</p>
          <Link href={urlBusca(filtros)} className={`${BOTAO_SECUNDARIO} mt-4 text-sm`}>
            Voltar para a primeira página
          </Link>
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
          <Link
            href={urlBusca(a.sem)}
            className="inline-flex items-center gap-1.5 rounded-full bg-marca-50 py-1 pr-2 pl-3 text-sm text-marca-900 ring-1 ring-marca-200 ring-inset hover:bg-marca-100"
          >
            {a.rotulo}
            <IconeFechar className="text-marca-700" aria-label="remover" />
          </Link>
        </li>
      ))}
      {ativos.length > 1 && (
        <li>
          <Link href="/buscar" className="text-sm text-slate-600 underline hover:text-slate-900">
            Limpar tudo
          </Link>
        </li>
      )}
    </ul>
  );
}

function Paginacao({ filtros, pagina, totalPaginas }: { filtros: Filtros; pagina: number; totalPaginas: number }) {
  const href = (p: number) => urlBusca(filtros, p > 1 ? { pagina: String(p) } : undefined);
  const classe = `${BOTAO_SECUNDARIO} text-sm`;
  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={href(pagina - 1)} className={classe} rel="prev">
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-slate-600">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={href(pagina + 1)} className={classe} rel="next">
          Próxima
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

// Sugere caminhos concretos: quais filtros afrouxar e quais regiões próximas
// têm resultado, sempre com a contagem real.
async function EstadoVazio({ filtros, catalogos }: { filtros: Filtros; catalogos: Catalogos }) {
  const afrouxar = filtrosAtivos(filtros, catalogos).filter((a) => a.chave !== "local");
  const vizinhos = filtros.local ? (VIZINHOS[filtros.local] ?? []) : [];

  const [semFiltro, porVizinho, todaRegiao] = await Promise.all([
    Promise.all(afrouxar.map(async (a) => ({ ...a, total: await contarVeterinarios(a.sem) }))),
    Promise.all(
      vizinhos.map(async (slug) => {
        const f = { ...filtros, local: slug, bairro: undefined };
        return { slug, filtros: f, total: await contarVeterinarios(f) };
      }),
    ),
    filtros.local ? contarVeterinarios({ ...filtros, local: undefined, bairro: undefined }) : 0,
  ]);

  const sugestoesFiltro = semFiltro.filter((s) => s.total > 0).sort((a, b) => b.total - a.total).slice(0, 4);
  const sugestoesVizinhos = porVizinho.filter((v) => v.total > 0).sort((a, b) => b.total - a.total);
  const nomeRegiao = (slug: string) => catalogos.regioes.find((r) => r.slug === slug)?.nome ?? slug;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-slate-900">Nenhum profissional com todos esses filtros</h3>
      <p className="mt-1 text-sm text-slate-600">Tente uma destas alternativas:</p>

      {sugestoesFiltro.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-900">Afrouxar um filtro</h4>
          <ul className="mt-2 space-y-1">
            {sugestoesFiltro.map((s) => (
              <li key={s.chave}>
                <Link href={urlBusca(s.sem)} className="text-sm text-marca-800 underline hover:text-marca-900">
                  Sem “{s.rotulo}”: {plural(s.total)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sugestoesVizinhos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-900">Buscar em regiões próximas</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {sugestoesVizinhos.map((v) => (
              <li key={v.slug}>
                <Link
                  href={urlBusca(v.filtros)}
                  className="inline-flex rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  {nomeRegiao(v.slug)} ({v.total})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {filtros.local && todaRegiao > 0 && (
          <Link href={urlBusca({ ...filtros, local: undefined, bairro: undefined })} className={`${BOTAO_SECUNDARIO} text-sm`}>
            Buscar em toda a região ({todaRegiao})
          </Link>
        )}
        <Link href={urlBusca(FILTROS_VAZIOS)} className={`${BOTAO_SECUNDARIO} text-sm`}>
          Limpar todos os filtros
        </Link>
      </div>
    </div>
  );
}
