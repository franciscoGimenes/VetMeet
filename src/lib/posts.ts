// Leitura da Rede. Dados públicos em cache (tag "rede", invalidada por toda
// ação que muda posts, curtidas ou comentários); o estado de quem está vendo
// (curtidas dele, se é o autor) é lido por requisição, fora do cache.
import { cacheLife, cacheTag } from "next/cache";
import { formatarCrmv } from "@/lib/crmv";
import {
  eUuid,
  POSTS_POR_PAGINA,
  urlFotoRede,
  type AutorPost,
  type Comentario,
  type FiltrosRede,
  type PostResumo,
} from "@/lib/rede";
import { createPublicClient } from "@/lib/supabase/public";

export const TAG_REDE = "rede";

const AUTOR = "id, slug, nome_exibicao, foto_url, crmv_numero, crmv_uf, crmv_secundaria, is_demo";

const SELECT_POST = `
  id, categoria, texto, created_at, editado_em, fixado_em, curtidas, comentarios, is_demo,
  veterinarians!posts_veterinarian_id_fkey!inner(${AUTOR}),
  post_images(caminho, largura, altura, ordem),
  post_species(species(slug, nome, ordem)),
  post_services(services(slug, nome, ordem))
` as const;

function consultaPosts() {
  return createPublicClient().from("posts").select(SELECT_POST);
}

type LinhaPost = NonNullable<Awaited<ReturnType<typeof consultaPosts>>["data"]>[number];
type LinhaAutor = LinhaPost["veterinarians"];

function mapearAutor(v: LinhaAutor): AutorPost {
  return {
    id: v.id,
    slug: v.slug,
    nome: v.nome_exibicao,
    fotoUrl: v.foto_url,
    crmv: formatarCrmv({ numero: v.crmv_numero, uf: v.crmv_uf, secundaria: v.crmv_secundaria }),
    isDemo: v.is_demo,
  };
}

const porOrdem = <T extends { ordem: number }>(a: T, b: T) => a.ordem - b.ordem;

function mapearPost(p: LinhaPost): PostResumo {
  return {
    id: p.id,
    categoria: p.categoria,
    texto: p.texto,
    criadoEm: p.created_at,
    editadoEm: p.editado_em,
    fixado: p.fixado_em !== null,
    curtidas: p.curtidas,
    comentarios: p.comentarios,
    isDemo: p.is_demo,
    autor: mapearAutor(p.veterinarians),
    fotos: [...p.post_images]
      .sort(porOrdem)
      .map((f) => ({ caminho: f.caminho, url: urlFotoRede(f.caminho), largura: f.largura, altura: f.altura })),
    especies: p.post_species.map((x) => x.species).sort(porOrdem).map(({ slug, nome }) => ({ slug, nome })),
    servicos: p.post_services.map((x) => x.services).sort(porOrdem).map(({ slug, nome }) => ({ slug, nome })),
  };
}

async function postsPorId(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await consultaPosts().in("id", ids);
  if (error) throw new Error(`Falha ao carregar publicações: ${error.message}`);
  const porId = new Map(data.map((p) => [p.id, mapearPost(p)]));
  return ids.flatMap((id) => porId.get(id) ?? []);
}

// Cursor = "created_at|id" do último post da página.
export type Pagina = { posts: PostResumo[]; proximo: string | null };

export async function listarPosts(f: FiltrosRede, cursor: string | null, autor?: string): Promise<Pagina> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_REDE);

  const [antes, antesId] = cursor?.split("|") ?? [];
  const { data, error } = await createPublicClient().rpc("buscar_posts", {
    p_categoria: f.categoria,
    p_especie: f.especie,
    p_servico: f.servico,
    p_regioes: f.local,
    p_autor: autor,
    p_antes: antes && eUuid(antesId) && !Number.isNaN(Date.parse(antes)) ? antes : undefined,
    p_antes_id: eUuid(antesId) ? antesId : undefined,
    p_limite: POSTS_POR_PAGINA,
  });
  if (error) throw new Error(`Falha ao listar publicações: ${error.message}`);
  const posts = await postsPorId(data);
  const ultimo = posts.at(-1);
  return { posts, proximo: data.length === POSTS_POR_PAGINA && ultimo ? `${ultimo.criadoEm}|${ultimo.id}` : null };
}

export async function getPost(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_REDE);
  if (!eUuid(id)) return null;
  const { data, error } = await consultaPosts().eq("id", id).maybeSingle();
  if (error) throw new Error(`Falha ao carregar publicação: ${error.message}`);
  return data ? mapearPost(data) : null;
}

export async function getFixados(vetId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_REDE);
  const { data, error } = await consultaPosts()
    .eq("veterinarian_id", vetId)
    .not("fixado_em", "is", null)
    .order("fixado_em", { ascending: false })
    .limit(3);
  if (error) throw new Error(`Falha ao carregar publicações fixadas: ${error.message}`);
  return data.map(mapearPost);
}

export async function getComentarios(postId: string): Promise<Comentario[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_REDE);
  const { data, error } = await createPublicClient()
    .from("post_comments")
    .select(`id, texto, created_at, veterinarians!post_comments_veterinarian_id_fkey!inner(${AUTOR})`)
    .eq("post_id", postId)
    .order("created_at")
    .limit(300);
  if (error) throw new Error(`Falha ao carregar comentários: ${error.message}`);
  return data.map((c) => ({ id: c.id, texto: c.texto, criadoEm: c.created_at, autor: mapearAutor(c.veterinarians) }));
}

// Posts recentes para a página inicial.
export async function postsRecentes(quantidade: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_REDE);
  const { data, error } = await createPublicClient().rpc("buscar_posts", { p_limite: quantidade });
  if (error) throw new Error(`Falha ao listar publicações: ${error.message}`);
  return postsPorId(data);
}
