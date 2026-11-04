// Rede: categorias, limites, filtros do feed e validação do post.
// Funções puras (servidor e cliente).
import type { Catalogos } from "@/lib/catalogos";
import type { Database } from "@/types/database";

export type CategoriaValor = Database["public"]["Enums"]["post_categoria"];

// slug = valor na URL (?categoria=...).
export const CATEGORIAS: { valor: CategoriaValor; slug: string; nome: string }[] = [
  { valor: "dica_tutores", slug: "dica-para-tutores", nome: "Dica para tutores" },
  { valor: "relato_caso", slug: "relato-de-caso", nome: "Relato de caso" },
  { valor: "atendimento", slug: "atendimento", nome: "Atendimento" },
  { valor: "bastidores", slug: "bastidores", nome: "Bastidores" },
  { valor: "curso_capacitacao", slug: "curso-e-capacitacao", nome: "Curso e capacitação" },
  { valor: "outros", slug: "outros", nome: "Outros" },
];

export const nomeCategoria = (valor: CategoriaValor) => CATEGORIAS.find((c) => c.valor === valor)?.nome ?? "Outros";

export const TEXTO_MAX = 3000;
export const COMENTARIO_MAX = 1000;
export const FOTOS_MAX = 6;
export const POSTS_POR_PAGINA = 10;
export const BUCKET_REDE = "fotos-rede";

export const urlFotoRede = (caminho: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_REDE}/${caminho}`;

// "{user_id}/{uuid}.webp" (ou .jpg, quando o navegador não gera WebP).
export const CAMINHO_FOTO = /^([0-9a-f-]{36})\/[0-9a-f-]{36}\.(webp|jpg)$/;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const eUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

// ---------------------------------------------------------------------------
// Tipos do post já pronto para a tela
// ---------------------------------------------------------------------------
type Item = { slug: string; nome: string };

export type AutorPost = { id: string; slug: string; nome: string; fotoUrl: string | null; crmv: string; isDemo: boolean };

export type FotoPost = { caminho: string; url: string; largura: number; altura: number };

export type PostResumo = {
  id: string;
  categoria: CategoriaValor;
  texto: string;
  criadoEm: string;
  editadoEm: string | null;
  fixado: boolean;
  curtidas: number;
  comentarios: number;
  isDemo: boolean;
  autor: AutorPost;
  fotos: FotoPost[];
  especies: Item[];
  servicos: Item[];
};

export type Comentario = { id: number; texto: string; criadoEm: string; autor: AutorPost };

// Quem está vendo: muda o que acontece ao tocar em curtir e comentar.
export type Visitante =
  | { tipo: "visitante" }
  // Logado, mas sem perfil publicado (ou pausado): não interage.
  | { tipo: "sem-perfil" }
  | { tipo: "veterinario"; vetId: string; userId: string };

// Datas sempre absolutas e no fuso de São Paulo: o mesmo texto no servidor e no navegador.
export function dataPost(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

// ---------------------------------------------------------------------------
// Filtros do feed <-> URL
// ---------------------------------------------------------------------------
export type FiltrosRede = {
  categoria?: CategoriaValor;
  especie?: string;
  servico?: string;
  local: string[];
};

type ParamsBrutos = Record<string, string | string[] | undefined>;
const lista = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

export function parseFiltrosRede(params: ParamsBrutos, cat: Catalogos): FiltrosRede {
  const categoria = CATEGORIAS.find((c) => c.slug === lista(params.categoria)[0])?.valor;
  const tem = (itens: { slug: string }[], v?: string) => (v && itens.some((i) => i.slug === v) ? v : undefined);
  const regioes = new Set(cat.regioes.map((r) => r.slug));
  return {
    categoria,
    especie: tem(cat.especies, lista(params.especie)[0]),
    servico: tem(cat.servicos, lista(params.servico)[0]),
    local: [...new Set(lista(params.local).filter((l) => regioes.has(l)))],
  };
}

export function paramsRede(f: FiltrosRede) {
  const p = new URLSearchParams();
  const cat = CATEGORIAS.find((c) => c.valor === f.categoria);
  if (cat) p.set("categoria", cat.slug);
  if (f.especie) p.set("especie", f.especie);
  if (f.servico) p.set("servico", f.servico);
  f.local.forEach((l) => p.append("local", l));
  return p;
}

export function urlRede(f: FiltrosRede) {
  const q = paramsRede(f).toString();
  return q ? `/rede?${q}` : "/rede";
}

// Filtros do painel (a categoria fica nos chips, fora da contagem).
export const contarFiltrosPainel = (f: FiltrosRede) => Number(Boolean(f.especie)) + Number(Boolean(f.servico)) + f.local.length;

// ---------------------------------------------------------------------------
// Validação do post (formulário e servidor)
// ---------------------------------------------------------------------------
export type DadosPost = {
  id?: string;
  categoria: string;
  texto: string;
  fotos: { caminho: string; largura: number; altura: number }[];
  especies: string[];
  servicos: string[];
};

export type ErrosPost = Partial<Record<"categoria" | "texto" | "fotos", string>>;

export function validarPost(d: DadosPost, userId?: string): ErrosPost {
  const erros: ErrosPost = {};
  if (!CATEGORIAS.some((c) => c.valor === d.categoria)) erros.categoria = "Escolha uma categoria.";
  const texto = d.texto.trim();
  if (!texto) erros.texto = "Escreva o texto da publicação.";
  else if (texto.length > TEXTO_MAX) erros.texto = `O texto passa de ${TEXTO_MAX.toLocaleString("pt-BR")} caracteres.`;
  if (d.fotos.length > FOTOS_MAX) erros.fotos = `No máximo ${FOTOS_MAX} fotos.`;
  else if (
    d.fotos.some((f) => {
      const m = CAMINHO_FOTO.exec(f.caminho);
      const dim = (n: number) => Number.isInteger(n) && n >= 1 && n <= 4000;
      return !m || (userId !== undefined && m[1] !== userId) || !dim(f.largura) || !dim(f.altura);
    })
  )
    erros.fotos = "Uma das fotos não foi enviada corretamente. Remova e envie de novo.";
  return erros;
}
