import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { BOTAO_SECUNDARIO, CHIP } from "@/components/estilos";
import { getCatalogos, type Catalogos } from "@/lib/catalogos";
import { DISPONIBILIDADES } from "@/lib/filtros";
import { createClient } from "@/lib/supabase/server";
import { sair } from "./actions";
import { GraficoCliques } from "./GraficoCliques";

type Painel = {
  inicio: string;
  fim: string;
  totais: {
    cliques: number;
    cliques_demo: number;
    buscas: number;
    buscas_sem_resultado: number;
    pre_cadastros: number;
    pre_cadastros_total: number;
  };
  cliques_por_dia: { dia: string; total: number; whatsapp: number; demo: number }[];
  filtros: { chave: string; valor: string; total: number }[];
  cidades: { local: string; total: number; sem_resultado: number }[];
  veterinarios: { slug: string; demo: boolean; total: number; whatsapp: number; perfil: number; card: number }[];
};

const PERIODOS = [7, 30, 90] as const;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function PaginaAdmin({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { dias: diasParam } = await searchParams;
  const dias = PERIODOS.find((p) => String(p) === diasParam) ?? 30;

  const [painel, preCadastros, catalogos] = await Promise.all([
    supabase.rpc("painel_admin", { p_dias: dias }),
    supabase
      .from("vet_waitlist")
      .select("id, nome, crmv_numero, crmv_uf, whatsapp, email, especies, modalidades, created_at, regions(nome)")
      .order("created_at", { ascending: false })
      .limit(200),
    getCatalogos(),
  ]);

  if (painel.error) {
    if (painel.error.code !== "42501") throw new Error(painel.error.message);
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Sem acesso ao painel</h1>
        <p className="mt-2 text-sm text-slate-600">{user.email} não está na lista de administradores.</p>
        <form action={sair} className="mt-6">
          <button className={BOTAO_SECUNDARIO}>Sair</button>
        </form>
      </div>
    );
  }

  const p = painel.data as unknown as Painel;
  const nomesVets = await nomesDosVeterinarios(supabase, p.veterinarios.map((v) => v.slug));
  const nomeRegiao = (slug: string) => catalogos.regioes.find((r) => r.slug === slug)?.nome ?? slug;
  const lista = preCadastros.data ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel</h1>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Período" className="flex rounded-xl border border-slate-300 bg-white p-0.5 text-sm">
            {PERIODOS.map((d) => (
              <Link
                key={d}
                href={`/admin?dias=${d}`}
                aria-current={d === dias ? "page" : undefined}
                className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-marca-700 aria-[current=page]:text-white"
              >
                {d} dias
              </Link>
            ))}
          </nav>
          <form action={sair}>
            <button className="text-sm text-slate-600 underline hover:text-slate-900">Sair</button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Numero
          rotulo="Cliques de contato"
          valor={p.totais.cliques}
          detalhe={`${p.totais.cliques_demo} em perfis demo`}
        />
        <Numero
          rotulo="Buscas"
          valor={p.totais.buscas}
          detalhe={`${p.totais.buscas_sem_resultado} sem resultado`}
        />
        <Numero
          rotulo="Pré-cadastros"
          valor={p.totais.pre_cadastros}
          detalhe={`${p.totais.pre_cadastros_total} no total`}
        />
      </div>

      <Bloco titulo="Cliques de contato por dia" className="mt-6">
        <GraficoCliques dias={p.cliques_por_dia} />
      </Bloco>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Bloco titulo="Cidades mais buscadas">
          {p.cidades.length ? (
            <ListaBarras
              itens={p.cidades.map((c) => ({
                rotulo: nomeRegiao(c.local),
                total: c.total,
                nota: c.sem_resultado ? `${c.sem_resultado} sem resultado` : undefined,
              }))}
            />
          ) : (
            <Vazio>Nenhuma busca com cidade no período.</Vazio>
          )}
        </Bloco>

        <Bloco titulo="Filtros mais usados">
          {p.filtros.length ? (
            <ListaBarras
              itens={p.filtros.map((f) => ({
                rotulo: rotuloFiltro(f.chave, f.valor, catalogos),
                total: f.total,
              }))}
            />
          ) : (
            <Vazio>Nenhum filtro usado no período.</Vazio>
          )}
        </Bloco>
      </div>

      <Bloco titulo="Veterinários mais contatados" className="mt-6">
        {p.veterinarios.length ? (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="w-full min-w-[32rem] text-left text-sm tabular-nums">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2 font-medium">Profissional</th>
                  <th className="py-2 text-right font-medium">Cliques</th>
                  <th className="py-2 text-right font-medium">WhatsApp</th>
                  <th className="py-2 text-right font-medium">No card</th>
                  <th className="py-2 text-right font-medium">No perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {p.veterinarios.map((v) => (
                  <tr key={`${v.slug}-${v.demo}`}>
                    <td className="py-2">
                      <Link href={`/vet/${v.slug}`} className="font-medium text-slate-900 hover:underline">
                        {nomesVets.get(v.slug) ?? v.slug}
                      </Link>
                      {v.demo && <span className={`${CHIP} ml-2`}>demo</span>}
                    </td>
                    <td className="py-2 text-right font-semibold">{v.total}</td>
                    <td className="py-2 text-right">{v.whatsapp}</td>
                    <td className="py-2 text-right">{v.card}</td>
                    <td className="py-2 text-right">{v.perfil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhum clique de contato no período.</Vazio>
        )}
      </Bloco>

      <Bloco
        titulo={`Pré-cadastro (${p.totais.pre_cadastros_total})`}
        className="mt-6"
        acao={
          lista.length > 0 && (
            <a href="/admin/pre-cadastro.csv" download className={`${BOTAO_SECUNDARIO} text-sm`}>
              Baixar CSV
            </a>
          )
        }
      >
        {lista.length ? (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2 font-medium">Data</th>
                  <th className="py-2 font-medium">Nome</th>
                  <th className="py-2 font-medium">CRMV</th>
                  <th className="py-2 font-medium">Cidade</th>
                  <th className="py-2 font-medium">WhatsApp</th>
                  <th className="py-2 font-medium">E-mail</th>
                  <th className="py-2 font-medium">Espécies</th>
                  <th className="py-2 font-medium">Modalidades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {lista.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 whitespace-nowrap text-slate-600 tabular-nums">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                    </td>
                    <td className="py-2 font-medium text-slate-900">{c.nome}</td>
                    <td className="py-2 whitespace-nowrap">
                      {c.crmv_uf} {c.crmv_numero}
                    </td>
                    <td className="py-2">{c.regions?.nome}</td>
                    <td className="py-2 whitespace-nowrap">
                      <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-marca-800 hover:underline">
                        {formatarTelefone(c.whatsapp)}
                      </a>
                    </td>
                    <td className="py-2">
                      <a href={`mailto:${c.email}`} className="text-marca-800 hover:underline">
                        {c.email}
                      </a>
                    </td>
                    <td className="py-2">{nomes(c.especies, catalogos.especies)}</td>
                    <td className="py-2">{nomes(c.modalidades, catalogos.modos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhum pré-cadastro ainda.</Vazio>
        )}
      </Bloco>
    </>
  );
}

async function nomesDosVeterinarios(supabase: Awaited<ReturnType<typeof createClient>>, slugs: string[]) {
  if (!slugs.length) return new Map<string, string>();
  const { data } = await supabase.from("veterinarians").select("slug, nome_exibicao").in("slug", slugs);
  return new Map((data ?? []).map((v) => [v.slug, v.nome_exibicao]));
}

const ROTULO_CHAVE: Record<string, string> = {
  especie: "Espécie",
  servico: "Serviço",
  area: "Área",
  modo: "Modalidade",
  pagamento: "Pagamento",
  disp: "Disponibilidade",
  preco: "Consulta até",
};

function rotuloFiltro(chave: string, valor: string, cat: Catalogos) {
  const listas: Record<string, { slug: string; nome: string }[]> = {
    especie: cat.especies,
    servico: cat.servicos,
    area: cat.areas,
    modo: cat.modos,
    pagamento: cat.pagamentos,
    disp: [...DISPONIBILIDADES],
  };
  const nome = chave === "preco" ? `R$ ${valor}` : (listas[chave]?.find((i) => i.slug === valor)?.nome ?? valor);
  return `${ROTULO_CHAVE[chave] ?? chave}: ${nome}`;
}

const nomes = (slugs: string[], itens: { slug: string; nome: string }[]) =>
  slugs.map((s) => itens.find((i) => i.slug === s)?.nome ?? s).join(", ");

function formatarTelefone(numero: string) {
  const d = numero.replace(/^55/, "");
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{rotulo}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
        {valor.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detalhe}</p>
    </div>
  );
}

function Bloco({
  titulo,
  acao,
  className = "",
  children,
}: {
  titulo: string;
  acao?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

// Ranking em barras horizontais (uma série, mesma cor do gráfico); o número
// fica sempre visível ao lado, então a barra só reforça a comparação.
function ListaBarras({ itens }: { itens: { rotulo: string; total: number; nota?: string }[] }) {
  const max = Math.max(1, ...itens.map((i) => i.total));
  return (
    <ol className="space-y-2.5">
      {itens.map((i) => (
        <li key={i.rotulo}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-800">{i.rotulo}</span>
            <span className="shrink-0 text-slate-900 tabular-nums">
              <strong>{i.total}</strong>
              {i.nota && <span className="ml-2 text-xs text-slate-500">{i.nota}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-marca-600" style={{ width: `${(i.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
