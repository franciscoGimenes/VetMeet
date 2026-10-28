// Filtros da busca <-> query string. Funções puras: usadas no servidor e no cliente.
import type { Catalogos } from "@/lib/catalogos";

export const DISPONIBILIDADES = [
  { slug: "emergencia", nome: "Emergência" },
  { slug: "fim-de-semana", nome: "Fim de semana" },
  { slug: "noturno", nome: "Noturno" },
] as const;

export const PRECOS_MAX = [150, 200, 250, 300] as const;

export type Filtros = {
  local?: string;
  bairro?: string;
  especie?: string;
  area?: string;
  servico?: string;
  modo: string[];
  pagamento: string[];
  disp: string[];
  preco?: number;
};

export type ChaveFiltro = keyof Filtros;

type ParamsBrutos = Record<string, string | string[] | undefined>;

const lista = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
const unico = (v: string | string[] | undefined) => lista(v)[0];

// Descarta qualquer valor que não exista no catálogo, para a URL nunca quebrar a busca.
export function parseFiltros(params: ParamsBrutos, cat: Catalogos): Filtros {
  const slugs = (itens: { slug: string }[]) => new Set(itens.map((i) => i.slug));
  const regioes = slugs(cat.regioes);
  const valido = (set: Set<string>, v?: string) => (v && set.has(v) ? v : undefined);

  const local = valido(regioes, unico(params.local));
  const regiao = cat.regioes.find((r) => r.slug === local);
  const bairro = regiao
    ? valido(
        slugs(cat.bairros.filter((b) => b.region_id === regiao.id)),
        unico(params.bairro),
      )
    : undefined;

  const modos = slugs(cat.modos);
  const pagamentos = slugs(cat.pagamentos);
  const disps = new Set<string>(DISPONIBILIDADES.map((d) => d.slug));
  const preco = Number(unico(params.preco));

  return {
    local,
    bairro,
    especie: valido(slugs(cat.especies), unico(params.especie)),
    area: valido(slugs(cat.areas), unico(params.area)),
    servico: valido(slugs(cat.servicos), unico(params.servico)),
    modo: [...new Set(lista(params.modo).filter((m) => modos.has(m)))],
    pagamento: [...new Set(lista(params.pagamento).filter((p) => pagamentos.has(p)))],
    disp: [...new Set(lista(params.disp).filter((d) => disps.has(d)))],
    preco: Number.isFinite(preco) && preco > 0 ? preco : undefined,
  };
}

export function filtrosParaParams(f: Filtros, extra?: Record<string, string>) {
  const p = new URLSearchParams();
  if (f.local) p.set("local", f.local);
  if (f.local && f.bairro) p.set("bairro", f.bairro);
  if (f.especie) p.set("especie", f.especie);
  if (f.servico) p.set("servico", f.servico);
  if (f.area) p.set("area", f.area);
  f.modo.forEach((m) => p.append("modo", m));
  f.disp.forEach((d) => p.append("disp", d));
  if (f.preco) p.set("preco", String(f.preco));
  f.pagamento.forEach((m) => p.append("pagamento", m));
  for (const [k, v] of Object.entries(extra ?? {})) p.set(k, v);
  return p;
}

export function urlBusca(f: Filtros, extra?: Record<string, string>) {
  const qs = filtrosParaParams(f, extra).toString();
  return qs ? `/buscar?${qs}` : "/buscar";
}

export const FILTROS_VAZIOS: Filtros = { modo: [], pagamento: [], disp: [] };

export function temFiltros(f: Filtros) {
  return filtrosParaParams(f).toString() !== "";
}

// Lista plana dos filtros ativos, cada um com a versão dos filtros sem ele.
export function filtrosAtivos(f: Filtros, cat: Catalogos) {
  const nome = (itens: { slug: string; nome: string }[], slug?: string) =>
    itens.find((i) => i.slug === slug)?.nome ?? slug ?? "";
  const ativos: { chave: string; rotulo: string; sem: Filtros }[] = [];

  if (f.local) {
    ativos.push({ chave: "local", rotulo: nome(cat.regioes, f.local), sem: { ...f, local: undefined, bairro: undefined } });
  }
  if (f.bairro) ativos.push({ chave: "bairro", rotulo: nome(cat.bairros, f.bairro), sem: { ...f, bairro: undefined } });
  if (f.especie) ativos.push({ chave: "especie", rotulo: nome(cat.especies, f.especie), sem: { ...f, especie: undefined } });
  if (f.servico) ativos.push({ chave: "servico", rotulo: nome(cat.servicos, f.servico), sem: { ...f, servico: undefined } });
  if (f.area) ativos.push({ chave: "area", rotulo: nome(cat.areas, f.area), sem: { ...f, area: undefined } });
  for (const m of f.modo) {
    ativos.push({ chave: `modo:${m}`, rotulo: nome(cat.modos, m), sem: { ...f, modo: f.modo.filter((x) => x !== m) } });
  }
  for (const d of f.disp) {
    ativos.push({ chave: `disp:${d}`, rotulo: nome([...DISPONIBILIDADES], d), sem: { ...f, disp: f.disp.filter((x) => x !== d) } });
  }
  if (f.preco) ativos.push({ chave: "preco", rotulo: `Consulta até R$ ${f.preco}`, sem: { ...f, preco: undefined } });
  for (const p of f.pagamento) {
    ativos.push({ chave: `pagamento:${p}`, rotulo: nome(cat.pagamentos, p), sem: { ...f, pagamento: f.pagamento.filter((x) => x !== p) } });
  }
  return ativos;
}

// Versão compacta para gravar em contact_events.filtros_usados.
export function filtrosParaLog(f: Filtros) {
  const log: Record<string, string | string[] | number> = {};
  for (const [k, v] of Object.entries(f)) {
    if (Array.isArray(v) ? v.length : v !== undefined) log[k] = v as string | string[] | number;
  }
  return log;
}
