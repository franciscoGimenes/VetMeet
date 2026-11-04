"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { listarPosts, TAG_REDE, type Pagina } from "@/lib/posts";
import {
  BUCKET_REDE,
  CATEGORIAS,
  COMENTARIO_MAX,
  eUuid,
  validarPost,
  type DadosPost,
  type ErrosPost,
  type FiltrosRede,
} from "@/lib/rede";
import { createClient } from "@/lib/supabase/server";
import { curtidosPor, getVisitante } from "@/lib/visitante";

async function sessao() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ---------------------------------------------------------------------------
// Publicar e editar
// ---------------------------------------------------------------------------
export type EstadoPost = { erro?: string; erros?: ErrosPost };

function lerFormularioPost(form: FormData): DadosPost {
  let fotos: DadosPost["fotos"] = [];
  try {
    const bruto = JSON.parse(String(form.get("fotos") ?? "[]"));
    if (Array.isArray(bruto))
      fotos = bruto.map((f) => ({ caminho: String(f?.caminho ?? ""), largura: Number(f?.largura), altura: Number(f?.altura) }));
  } catch {
    fotos = [{ caminho: "", largura: 0, altura: 0 }];
  }
  const id = String(form.get("id") ?? "");
  return {
    id: eUuid(id) ? id : undefined,
    categoria: String(form.get("categoria") ?? ""),
    texto: String(form.get("texto") ?? "").replace(/\r\n/g, "\n"),
    fotos,
    especies: form.getAll("especies").map(String),
    servicos: form.getAll("servicos").map(String),
  };
}

export async function salvarPost(_anterior: EstadoPost, form: FormData): Promise<EstadoPost> {
  const { supabase, user } = await sessao();
  if (!user) redirect("/entrar");

  const dados = lerFormularioPost(form);
  const erros = validarPost(dados, user.id);
  if (Object.keys(erros).length) return { erros };

  // Fotos que saíram na edição: apagadas do Storage depois de salvar.
  let antigas: string[] = [];
  if (dados.id) {
    const { data } = await supabase.from("post_images").select("caminho").eq("post_id", dados.id);
    antigas = (data ?? []).map((f) => f.caminho);
  }

  const { data: id, error } = await supabase.rpc("salvar_post", {
    p: { ...dados, texto: dados.texto.trim() },
  });
  if (error || !id) {
    console.error("salvar post:", error?.message);
    if (error?.message.includes("sem_perfil")) return { erro: "Publique seu perfil antes de usar a Rede." };
    if (error?.message.includes("post_nao_encontrado")) return { erro: "Esta publicação não existe mais." };
    return { erro: "Não foi possível salvar agora. Tente de novo." };
  }

  const removidas = antigas.filter((c) => !dados.fotos.some((f) => f.caminho === c));
  if (removidas.length) await supabase.storage.from(BUCKET_REDE).remove(removidas);

  updateTag(TAG_REDE);
  redirect(`/rede/post/${id}`);
}

export async function excluirPost(id: string): Promise<{ ok: true } | { erro: string }> {
  const { supabase, user } = await sessao();
  if (!user || !eUuid(id)) return { erro: "Não foi possível excluir." };
  const { data: fotos } = await supabase.from("post_images").select("caminho").eq("post_id", id);
  const { data, error } = await supabase.from("posts").delete().eq("id", id).select("id");
  if (error || !data?.length) return { erro: "Não foi possível excluir." };
  const caminhos = (fotos ?? []).map((f) => f.caminho);
  if (caminhos.length) await supabase.storage.from(BUCKET_REDE).remove(caminhos);
  updateTag(TAG_REDE);
  return { ok: true };
}

export async function alternarFixado(id: string, fixar: boolean): Promise<{ ok: true } | { erro: string }> {
  const { supabase, user } = await sessao();
  if (!user || !eUuid(id)) return { erro: "Não foi possível alterar." };
  const { data, error } = await supabase
    .from("posts")
    .update({ fixado_em: fixar ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error?.message.includes("limite_fixados"))
    return { erro: "Você já tem 3 publicações fixadas. Desafixe uma para fixar esta." };
  if (error || !data?.length) return { erro: "Não foi possível alterar." };
  updateTag(TAG_REDE);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Curtir e comentar (só veterinários com perfil ativo; o RLS confere de novo)
// ---------------------------------------------------------------------------
export async function curtir(postId: string, curtido: boolean): Promise<{ curtidas: number } | { erro: string }> {
  const visitante = await getVisitante();
  if (visitante.tipo !== "veterinario" || !eUuid(postId)) return { erro: "Interação exclusiva para veterinários." };
  const supabase = await createClient();
  const { error } = curtido
    ? await supabase
        .from("post_likes")
        .upsert({ post_id: postId, veterinarian_id: visitante.vetId }, { ignoreDuplicates: true })
    : await supabase.from("post_likes").delete().eq("post_id", postId).eq("veterinarian_id", visitante.vetId);
  if (error) {
    console.error("curtir:", error.message);
    return { erro: "Não foi possível curtir agora." };
  }
  const { data } = await supabase.from("posts").select("curtidas").eq("id", postId).single();
  updateTag(TAG_REDE);
  return { curtidas: data?.curtidas ?? 0 };
}

export type EstadoComentario = { erro?: string; ok?: number };

export async function comentar(_anterior: EstadoComentario, form: FormData): Promise<EstadoComentario> {
  const visitante = await getVisitante();
  const postId = String(form.get("post_id") ?? "");
  if (visitante.tipo !== "veterinario" || !eUuid(postId)) return { erro: "Interação exclusiva para veterinários." };
  const texto = String(form.get("texto") ?? "").replace(/\r\n/g, "\n").trim();
  if (!texto) return { erro: "Escreva o comentário." };
  if (texto.length > COMENTARIO_MAX) return { erro: `O comentário passa de ${COMENTARIO_MAX} caracteres.` };
  const supabase = await createClient();
  const { error } = await supabase.from("post_comments").insert({ post_id: postId, veterinarian_id: visitante.vetId, texto });
  if (error) {
    console.error("comentar:", error.message);
    return { erro: "Não foi possível comentar agora." };
  }
  updateTag(TAG_REDE);
  return { ok: Date.now() };
}

export async function apagarComentario(id: number): Promise<{ ok: true } | { erro: string }> {
  const { supabase, user } = await sessao();
  if (!user || !Number.isInteger(id)) return { erro: "Não foi possível apagar." };
  const { data, error } = await supabase.from("post_comments").delete().eq("id", id).select("id");
  if (error || !data?.length) return { erro: "Não foi possível apagar." };
  updateTag(TAG_REDE);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Carregar mais (feed e aba Publicações)
// ---------------------------------------------------------------------------
export async function carregarMais(
  filtros: FiltrosRede,
  cursor: string,
  autor?: string,
): Promise<Pagina & { curtidos: string[] }> {
  // Vem do navegador: só passa adiante o que tem formato válido.
  const texto = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{1,60}$/.test(v) ? v : undefined);
  const pagina = await listarPosts(
    {
      categoria: CATEGORIAS.find((c) => c.valor === filtros.categoria)?.valor,
      especie: texto(filtros.especie),
      servico: texto(filtros.servico),
      local: Array.isArray(filtros.local) ? filtros.local.flatMap((l) => texto(l) ?? []).slice(0, 30) : [],
    },
    cursor,
    autor && eUuid(autor) ? autor : undefined,
  );
  const curtidos = await curtidosPor(await getVisitante(), pagina.posts.map((p) => p.id));
  return { ...pagina, curtidos };
}
