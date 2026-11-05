import { CircleAlert, CircleCheck, CircleDashed, CircleMinus, CircleOff, CirclePause } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { EsqueletoAdmin, EsqueletoResumoAdmin, EsqueletoSecaoAdmin } from "@/components/Esqueletos";
import { Badge, BotaoEnviar, Card, Icon, buttonClasses } from "@/components/ui";
import { getCatalogos, type Catalogos } from "@/lib/catalogos";
import { formatarCrmv } from "@/lib/crmv";
import { MOTIVOS_DENUNCIA } from "@/lib/denuncia";
import { DISPONIBILIDADES } from "@/lib/filtros";
import { createClient } from "@/lib/supabase/server";
import { formatarTelefone } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";
import { alterarStatusPerfil, atualizarDenuncia, sair } from "./actions";
import { BotaoConvite } from "./BotaoConvite";
import { ExcluirPerfil } from "./ExcluirPerfil";
import { FormAcao } from "./FormAcao";
import { GraficoCliques } from "./GraficoCliques";
import { LinkPeriodo } from "./LinkPeriodo";

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
      <Suspense fallback={<EsqueletoAdmin />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Só confere o acesso e monta o cabeçalho; cada seção busca os próprios dados
// em paralelo e aparece quando fica pronta (uma seção lenta não segura as outras).
async function Conteudo({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: eAdmin },
    { dias: diasParam },
  ] = await Promise.all([supabase.auth.getUser(), supabase.rpc("is_admin"), searchParams]);
  if (!user) redirect("/admin/login");
  const dias = PERIODOS.find((p) => String(p) === diasParam) ?? 30;

  if (!eAdmin) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-h2 text-text">Sem acesso ao painel</h1>
        <p className="mt-2 text-small text-text-muted">{user.email} não está na lista de administradores.</p>
        <form action={sair} className="mt-6 md:mt-8">
          <BotaoEnviar variant="secondary" textoCarregando="Saindo...">
            Sair
          </BotaoEnviar>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 text-text">Painel</h1>
          <p className="truncate text-small text-text-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Período" className="flex gap-2 rounded-control border border-border-strong bg-surface p-1">
            {PERIODOS.map((d) => (
              <LinkPeriodo key={d} href={`/admin?dias=${d}`} atual={d === dias}>
                {d} dias
              </LinkPeriodo>
            ))}
          </nav>
          <form action={sair}>
            <BotaoEnviar variant="ghost" textoCarregando="Saindo...">
              Sair
            </BotaoEnviar>
          </form>
        </div>
      </div>

      {/* key: ao trocar o período, só esta parte volta ao esqueleto. */}
      <Suspense key={dias} fallback={<EsqueletoResumoAdmin />}>
        <Resumo dias={dias} />
      </Suspense>
      <Suspense fallback={<EsqueletoSecaoAdmin titulo="Perfis de veterinários" />}>
        <SecaoPerfis />
      </Suspense>
      <Suspense fallback={<EsqueletoSecaoAdmin titulo="Denúncias" />}>
        <SecaoDenuncias />
      </Suspense>
      <Suspense fallback={<EsqueletoSecaoAdmin titulo="Lista de espera" />}>
        <SecaoListaEspera />
      </Suspense>
    </>
  );
}

// As seções abaixo só são montadas depois do is_admin() em Conteudo; as que usam
// a service role leem dados que o RLS esconderia (perfis fora do ar, e-mails).

async function Resumo({ dias }: { dias: number }) {
  const supabase = await createClient();
  // Nomes em paralelo com os números (a tabela é pequena), com a service role
  // para achar também os perfis pausados ou fora do ar.
  const [painel, catalogos, vets] = await Promise.all([
    supabase.rpc("painel_admin", { p_dias: dias }),
    getCatalogos(),
    createAdminClient().from("veterinarians").select("slug, nome_exibicao"),
  ]);
  if (painel.error) throw new Error(painel.error.message);

  const p = painel.data as unknown as Painel;
  const nomesVets = new Map((vets.data ?? []).map((v) => [v.slug, v.nome_exibicao]));
  const nomeRegiao = (slug: string) => catalogos.regioes.find((r) => r.slug === slug)?.nome ?? slug;

  return (
    <>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 md:mt-8">
        <Numero rotulo="Cliques de contato" valor={p.totais.cliques} detalhe={`${p.totais.cliques_demo} em perfis demo`} />
        <Numero rotulo="Buscas" valor={p.totais.buscas} detalhe={`${p.totais.buscas_sem_resultado} sem resultado`} />
        <Numero
          rotulo="Pré-cadastros"
          valor={p.totais.pre_cadastros}
          detalhe={`${p.totais.pre_cadastros_total} no total`}
        />
      </div>

      <Bloco titulo="Cliques de contato por dia" className="mt-6 md:mt-8">
        {p.cliques_por_dia.length ? <GraficoCliques dias={p.cliques_por_dia} /> : <Vazio>Sem dados no período.</Vazio>}
      </Bloco>

      <div className="mt-6 grid gap-6 md:mt-8 md:gap-8 lg:grid-cols-2">
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

      <Bloco titulo="Veterinários mais contatados" className="mt-6 md:mt-8">
        {p.veterinarios.length ? (
          <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            <table className="w-full min-w-128 text-left text-small tabular-nums [&_td]:pr-4 [&_th]:pr-4">
              <thead className="text-caption text-text-muted">
                <tr>
                  <th className="py-2 font-medium">Profissional</th>
                  <th className="py-2 text-right font-medium">Cliques</th>
                  <th className="py-2 text-right font-medium">WhatsApp</th>
                  <th className="py-2 text-right font-medium">No card</th>
                  <th className="py-2 text-right font-medium">No perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.veterinarios.map((v) => {
                  const nome = nomesVets.get(v.slug);
                  return (
                    <tr key={`${v.slug}-${v.demo}`}>
                      <td className="py-2">
                        {nome ? (
                          <Link href={`/vet/${v.slug}`} className="inline-flex min-h-11 items-center font-medium text-text hover:underline">
                            {nome}
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-11 items-center text-text-muted">
                            {v.slug === "perfil-excluido" ? "Perfis excluídos" : v.slug}
                          </span>
                        )}
                        {v.demo && (
                          <span className="ml-2">
                            <Badge variant="demo">demo</Badge>
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right font-semibold">{v.total}</td>
                      <td className="py-2 text-right">{v.whatsapp}</td>
                      <td className="py-2 text-right">{v.card}</td>
                      <td className="py-2 text-right">{v.perfil}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhum clique de contato no período.</Vazio>
        )}
      </Bloco>
    </>
  );
}

async function SecaoPerfis() {
  const perfis = await listarPerfis();
  return (
    <Bloco titulo={`Perfis de veterinários (${perfis.vets.length})`} className="mt-6 md:mt-8">
      <p className="-mt-2 mb-4 text-small text-text-muted">
        Perfis reais e contas criadas. Tirar do ar esconde o perfil e as publicações (o veterinário não consegue
        reverter); excluir apaga tudo. Os {perfis.demos} perfis demo saem pelo script de remoção.
      </p>
      {perfis.vets.length + perfis.semPerfil.length ? (
        <ul className="divide-y divide-border">
          {perfis.vets.map((v) => {
            const st = STATUS_PERFIL[v.status];
            return (
              <li key={v.id} className={LINHA}>
                <div className="min-w-0 text-small">
                  <p className="flex flex-wrap items-center gap-2">
                    {v.status === "ativo" ? (
                      <Link href={`/vet/${v.slug}`} className="inline-flex min-h-11 items-center font-medium text-text hover:underline">
                        {v.nome}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center font-medium text-text">{v.nome}</span>
                    )}
                    <Badge variant={st.variante}>
                      <Icon icon={st.icone} size="sm" /> {st.rotulo}
                    </Badge>
                  </p>
                  <p className="text-text">{v.crmv}</p>
                  <p className="break-all text-text-muted">{v.email ?? "Sem conta (pré-cadastro antigo)"}</p>
                  <p className="mt-1 text-caption text-text-muted tabular-nums">
                    Criado em {dataCurta(v.criadoEm)} · {v.posts} {v.posts === 1 ? "publicação" : "publicações"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  {(v.status === "ativo" || v.status === "inativo") && (
                    <FormAcao acao={alterarStatusPerfil} campos={{ id: v.id }}>
                      <BotaoEnviar
                        name="status"
                        value={v.status === "ativo" ? "inativo" : "ativo"}
                        variant="secondary"
                        textoCarregando={v.status === "ativo" ? "Tirando do ar..." : "Pondo no ar..."}
                      >
                        {v.status === "ativo" ? "Tirar do ar" : "Pôr no ar"}
                      </BotaoEnviar>
                    </FormAcao>
                  )}
                  {v.admin ? (
                    <p className="inline-flex min-h-11 items-center text-caption text-text-muted">Conta de administrador</p>
                  ) : (
                    <ExcluirPerfil nome={v.nome} vetId={v.id} userId={v.userId} />
                  )}
                </div>
              </li>
            );
          })}
          {perfis.semPerfil.map((u) => (
            <li key={u.id} className={LINHA}>
              <div className="min-w-0 text-small">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex min-h-11 items-center font-medium break-all text-text">{u.email}</span>
                  <Badge variant="neutral">
                    <Icon icon={CircleDashed} size="sm" /> Conta sem perfil
                  </Badge>
                </p>
                <p className="mt-1 text-caption text-text-muted tabular-nums">Criada em {dataCurta(u.criadoEm)}</p>
              </div>
              <div className="flex shrink-0">
                <ExcluirPerfil nome={u.email} userId={u.id} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Vazio>Nenhum perfil real nem conta criada ainda.</Vazio>
      )}
    </Bloco>
  );
}

async function SecaoDenuncias() {
  // Service role: o nome aparece mesmo quando o perfil está pausado ou fora do ar.
  const { data, error } = await createAdminClient()
    .from("reports")
    .select("id, vet_slug, motivo, descricao, status, created_at, veterinarians(nome_exibicao, slug, status)")
    .order("status")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const lista = data ?? [];
  const abertas = lista.filter((d) => d.status === "aberta").length;

  return (
    <Bloco titulo={`Denúncias (${abertas} ${abertas === 1 ? "aberta" : "abertas"})`} className="mt-6 md:mt-8">
      {lista.length ? (
        <ul className="divide-y divide-border">
          {lista.map((d) => {
            const vet = d.veterinarians;
            const st = STATUS_DENUNCIA[d.status];
            return (
              <li key={d.id} className={LINHA}>
                <div className="min-w-0 text-small">
                  <p className="flex flex-wrap items-center gap-2">
                    {vet?.status === "ativo" ? (
                      <Link href={`/vet/${vet.slug}`} className="inline-flex min-h-11 items-center font-medium text-text hover:underline">
                        {vet.nome_exibicao}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center font-medium text-text">
                        {vet
                          ? `${vet.nome_exibicao} (fora da busca)`
                          : d.vet_slug === "perfil-excluido"
                            ? "Perfil excluído"
                            : d.vet_slug}
                      </span>
                    )}
                    <Badge variant={st.variante}>
                      <Icon icon={st.icone} size="sm" /> {st.rotulo}
                    </Badge>
                  </p>
                  <p className="text-text">{MOTIVOS_DENUNCIA.find((m) => m.slug === d.motivo)?.nome ?? d.motivo}</p>
                  {d.descricao && <p className="mt-1 whitespace-pre-line break-words text-text-muted">{d.descricao}</p>}
                  <p className="mt-1 text-caption text-text-muted tabular-nums">
                    {new Date(d.created_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <FormAcao acao={atualizarDenuncia} campos={{ id: d.id }} className="shrink-0">
                  {d.status === "aberta" ? (
                    <>
                      <BotaoEnviar name="status" value="analisada" variant="secondary" textoCarregando="Salvando...">
                        Analisada
                      </BotaoEnviar>
                      <BotaoEnviar name="status" value="descartada" variant="ghost" textoCarregando="Descartando...">
                        Descartar
                      </BotaoEnviar>
                    </>
                  ) : (
                    <BotaoEnviar name="status" value="aberta" variant="ghost" textoCarregando="Reabrindo...">
                      Reabrir
                    </BotaoEnviar>
                  )}
                </FormAcao>
              </li>
            );
          })}
        </ul>
      ) : (
        <Vazio>Nenhuma denúncia.</Vazio>
      )}
    </Bloco>
  );
}

async function SecaoListaEspera() {
  const supabase = await createClient();
  const [{ data, error }, catalogos] = await Promise.all([supabase.rpc("admin_lista_espera"), getCatalogos()]);
  if (error) throw new Error(error.message);
  const lista = data ?? [];

  return (
    <Bloco
      titulo={`Lista de espera (${lista.length})`}
      className="mt-6 md:mt-8"
      acao={
        lista.length > 0 && (
          <a href="/admin/pre-cadastro.csv" download className={buttonClasses({ variant: "secondary" })}>
            Baixar CSV
          </a>
        )
      }
    >
      {lista.length ? (
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <table className="w-full min-w-256 text-left text-small [&_td]:pr-4 [&_th]:pr-4">
            <thead className="text-caption text-text-muted">
              <tr>
                <th className="py-2 font-medium">Data</th>
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">CRMV</th>
                <th className="py-2 font-medium">Cidades</th>
                <th className="py-2 font-medium">WhatsApp</th>
                <th className="py-2 font-medium">E-mail</th>
                <th className="py-2 font-medium">Espécies</th>
                <th className="py-2 font-medium">Modalidades</th>
                <th className="py-2 font-medium">Conta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border align-top">
              {lista.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 whitespace-nowrap text-text-muted tabular-nums">{dataCurta(c.created_at)}</td>
                  <td className="py-2 font-medium text-text">
                    {c.nome}
                    {c.perfil_slug && (
                      <Link
                        href={`/vet/${c.perfil_slug}`}
                        className="ml-2 inline-flex min-h-11 items-center text-small font-normal text-primary hover:underline"
                      >
                        ver perfil
                      </Link>
                    )}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {formatarCrmv({ numero: c.crmv_numero, uf: c.crmv_uf, secundaria: false })}
                  </td>
                  <td className="py-2">{nomes(c.regioes, catalogos.regioes)}</td>
                  <td className="py-2 whitespace-nowrap">
                    <a
                      href={`https://wa.me/${c.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-primary hover:underline"
                    >
                      {formatarTelefone(c.whatsapp)}
                    </a>
                  </td>
                  <td className="py-2">
                    <a href={`mailto:${c.email}`} className="inline-flex min-h-11 items-center text-primary hover:underline">
                      {c.email}
                    </a>
                  </td>
                  <td className="py-2">{nomes(c.especies, catalogos.especies)}</td>
                  <td className="py-2">{nomes(c.modalidades, catalogos.modos)}</td>
                  <td className="py-2">
                    {c.tem_conta ? (
                      <Badge variant="success">
                        <Icon icon={CircleCheck} size="sm" /> Tem conta
                      </Badge>
                    ) : (
                      <BotaoConvite id={c.id} convidadoEm={c.convidado_em} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Vazio>Ninguém na lista de espera.</Vazio>
      )}
    </Bloco>
  );
}

const LINHA = "flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between";

const STATUS_DENUNCIA = {
  aberta: { rotulo: "Aberta", variante: "warning", icone: CircleAlert },
  analisada: { rotulo: "Analisada", variante: "neutral", icone: CircleCheck },
  descartada: { rotulo: "Descartada", variante: "neutral", icone: CircleMinus },
} as const;

// Perfis reais (com e-mail da conta) e contas que ainda não publicaram perfil.
// Service role: o RLS público só mostra perfis ativos.
async function listarPerfis() {
  const admin = createAdminClient();
  const [vets, contas, demos, admins] = await Promise.all([
    admin
      .from("veterinarians")
      .select("id, user_id, slug, nome_exibicao, crmv_numero, crmv_uf, crmv_secundaria, status, created_at, posts!posts_veterinarian_id_fkey(count)")
      .eq("is_demo", false)
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("veterinarians").select("id", { count: "exact", head: true }).eq("is_demo", true),
    admin.from("admins").select("email"),
  ]);
  if (vets.error) throw new Error(vets.error.message);
  const usuarios = contas.data?.users ?? [];
  const emails = new Map(usuarios.map((u) => [u.id, u.email ?? null]));
  const comPerfil = new Set((vets.data ?? []).map((v) => v.user_id));
  const deAdmins = new Set((admins.data ?? []).map((a) => a.email.toLowerCase()));
  return {
    demos: demos.count ?? 0,
    vets: (vets.data ?? []).map((v) => ({
      id: v.id,
      userId: v.user_id,
      slug: v.slug,
      nome: v.nome_exibicao,
      crmv: formatarCrmv({ numero: v.crmv_numero, uf: v.crmv_uf, secundaria: v.crmv_secundaria }),
      status: v.status,
      criadoEm: v.created_at,
      email: v.user_id ? (emails.get(v.user_id) ?? null) : null,
      admin: deAdmins.has(((v.user_id && emails.get(v.user_id)) || "").toLowerCase()),
      posts: v.posts[0]?.count ?? 0,
    })),
    semPerfil: usuarios
      .filter((u) => !comPerfil.has(u.id) && u.email && !deAdmins.has(u.email.toLowerCase()))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((u) => ({ id: u.id, email: u.email!, criadoEm: u.created_at })),
  };
}

const STATUS_PERFIL = {
  ativo: { rotulo: "No ar", variante: "success", icone: CircleCheck },
  pausado: { rotulo: "Pausado pelo veterinário", variante: "warning", icone: CirclePause },
  inativo: { rotulo: "Tirado do ar", variante: "error", icone: CircleOff },
  rascunho: { rotulo: "Rascunho", variante: "neutral", icone: CircleDashed },
} as const;

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });


const ROTULO_CHAVE: Record<string, string> = {
  q: "Nome",
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


function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe: string }) {
  return (
    // Número primeiro: no celular os três ficam lado a lado e o rótulo pode
    // quebrar linha sem desalinhar os números.
    <Card padding="lg" className="flex flex-col">
      <p className="order-2 mt-1 text-small text-text">{rotulo}</p>
      <p className="order-1 text-h1 text-text tabular-nums">{valor.toLocaleString("pt-BR")}</p>
      <p className="order-3 mt-1 text-caption text-text-muted">{detalhe}</p>
    </Card>
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
    <Card as="section" padding="lg" className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-h3 text-text">{titulo}</h2>
        {acao}
      </div>
      {children}
    </Card>
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
          <div className="flex items-baseline justify-between gap-3 text-small">
            <span className="min-w-0 truncate text-text">{i.rotulo}</span>
            <span className="shrink-0 text-text tabular-nums">
              <strong>{i.total}</strong>
              {i.nota && <span className="ml-2 text-caption text-text-muted">{i.nota}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-pill bg-border">
            <div className="h-full rounded-pill bg-chart" style={{ width: `${(i.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="text-small text-text-muted">{children}</p>;
}
