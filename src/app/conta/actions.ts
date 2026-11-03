"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCatalogos } from "@/lib/catalogos";
import { BUCKET_FOTOS, etapaDaConta, exigirSessao, getMeuPerfil } from "@/lib/conta";
import { lerFormularioPerfil, validarPerfil, type DadosPerfil, type ErrosPerfil } from "@/lib/perfil";
import { SENHA_MIN } from "@/lib/senha";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRIVACIDADE_VERSAO, TERMOS_VERSAO } from "@/lib/termos";
import { TAG_VETERINARIOS } from "@/lib/veterinarios";

const FALHA = "Não foi possível salvar agora. Tente novamente em alguns minutos.";

export type EstadoAceite = { erros?: Partial<Record<"declaracao" | "termos", string>>; erro?: string };

export async function registrarAceite(_anterior: EstadoAceite, form: FormData): Promise<EstadoAceite> {
  const erros: EstadoAceite["erros"] = {};
  if (form.get("declaracao") !== "sim") erros.declaracao = "Confirme a declaração para continuar.";
  if (form.get("termos") !== "sim") erros.termos = "Aceite os Termos de Uso e a Política de Privacidade.";
  if (Object.keys(erros).length) return { erros };

  const sessao = await exigirSessao();
  const { supabase, user } = sessao;
  const { error } = await supabase.from("vet_consents").insert({
    user_id: user.id,
    termos_versao: TERMOS_VERSAO,
    privacidade_versao: PRIVACIDADE_VERSAO,
    declaracao_crmv: true,
  });
  if (error) {
    console.error("aceite:", error.message);
    return { erro: FALHA };
  }
  // Direto para a próxima etapa: voltar para /conta reaproveitaria, no
  // navegador, a renderização anterior (que mandava para cá).
  const etapa = await etapaDaConta(sessao);
  redirect(typeof etapa === "string" ? etapa : "/conta");
}

export type EstadoPerfil = { erros?: ErrosPerfil; erro?: string; valores?: DadosPerfil };

export async function salvarPerfil(_anterior: EstadoPerfil, form: FormData): Promise<EstadoPerfil> {
  const dados = lerFormularioPerfil(form);
  const validacao = validarPerfil(dados, await getCatalogos());
  if (!validacao.ok) return { erros: validacao.erros, valores: dados };

  const sessao = await exigirSessao();
  const novo = !(await getMeuPerfil(sessao));
  const { error } = await sessao.supabase.rpc("salvar_meu_perfil", { p: validacao.payload });
  if (error) {
    // CRMV único entre perfis reais
    if (error.code === "23505" && error.message.includes("crmv")) {
      return {
        erros: { crmv_numero: "Já existe um perfil com este CRMV. Se é seu, fale com a gente pelo e-mail de contato." },
        valores: dados,
      };
    }
    console.error("salvar perfil:", error.code, error.message);
    return { erro: FALHA, valores: dados };
  }

  updateTag(TAG_VETERINARIOS);
  redirect(novo ? "/conta?publicado=1" : "/conta?salvo=1");
}

export async function alternarPausa() {
  const sessao = await exigirSessao();
  const perfil = await getMeuPerfil(sessao);
  if (!perfil || (perfil.status !== "ativo" && perfil.status !== "pausado")) redirect("/conta");
  const { error } = await sessao.supabase
    .from("veterinarians")
    .update({ status: perfil.status === "ativo" ? "pausado" : "ativo" })
    .eq("id", perfil.id);
  if (error) console.error("pausar:", error.message);
  updateTag(TAG_VETERINARIOS);
  redirect("/conta");
}

// A foto já foi enviada pelo navegador direto ao Storage (pasta do usuário,
// garantida pela policy); aqui só gravamos o endereço e apagamos as antigas.
export async function salvarFoto(caminho: string | null) {
  const { supabase, user } = await exigirSessao();
  if (caminho !== null && !new RegExp(`^${user.id}/[\\w-]+\\.(webp|jpg)$`).test(caminho)) {
    return { erro: "Arquivo inválido." };
  }
  const url = caminho ? supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl : null;
  const { error } = await supabase.from("veterinarians").update({ foto_url: url }).eq("user_id", user.id);
  if (error) {
    console.error("foto:", error.message);
    return { erro: FALHA };
  }

  const { data: arquivos } = await supabase.storage.from(BUCKET_FOTOS).list(user.id);
  const antigos = (arquivos ?? []).map((a) => `${user.id}/${a.name}`).filter((c) => c !== caminho);
  if (antigos.length) await supabase.storage.from(BUCKET_FOTOS).remove(antigos);

  updateTag(TAG_VETERINARIOS);
  return { ok: true };
}

export type EstadoSenha = { erro?: string };

export async function definirSenha(_anterior: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const senha = String(form.get("senha") ?? "");
  if (senha.length < SENHA_MIN) return { erro: `Use pelo menos ${SENHA_MIN} caracteres.` };
  if (senha !== form.get("confirmacao")) return { erro: "As duas senhas não são iguais." };
  const { supabase } = await exigirSessao();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    if (error.code === "same_password") return { erro: "A nova senha precisa ser diferente da atual." };
    if (error.code === "weak_password") return { erro: "Senha fraca ou já vazada. Escolha outra." };
    console.error("nova senha:", error.code, error.message);
    return { erro: FALHA };
  }
  redirect("/conta?senha=1");
}

export type EstadoExclusao = { erro?: string };

export async function excluirConta(_anterior: EstadoExclusao, form: FormData): Promise<EstadoExclusao> {
  if (String(form.get("confirmacao") ?? "").trim().toUpperCase() !== "EXCLUIR") {
    return { erro: "Digite EXCLUIR para confirmar." };
  }
  const { supabase, user } = await exigirSessao();
  const admin = createAdminClient();

  // Foto, pré-cadastro com o mesmo e-mail e a conta. A conta leva junto, em
  // cascata, o perfil, os locais, os vínculos e os aceites; os registros de
  // contato e de denúncia ficam sem o nome (trigger veterinarians_anonimiza).
  const { data: arquivos } = await admin.storage.from(BUCKET_FOTOS).list(user.id);
  if (arquivos?.length) {
    await admin.storage.from(BUCKET_FOTOS).remove(arquivos.map((a) => `${user.id}/${a.name}`));
  }
  if (user.email) await admin.from("vet_waitlist").delete().eq("email", user.email.toLowerCase());
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("excluir conta:", error.message);
    return { erro: "Não foi possível excluir agora. Tente novamente ou fale com a gente pelo e-mail de contato." };
  }

  // A sessão já não vale no servidor; só limpa os cookies.
  await supabase.auth.signOut({ scope: "local" });
  updateTag(TAG_VETERINARIOS);
  redirect("/entrar?conta=excluida");
}

export async function sairDaConta() {
  const { supabase } = await exigirSessao();
  await supabase.auth.signOut();
  redirect("/entrar");
}
