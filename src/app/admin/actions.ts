"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { enviarEmail, escaparHtml } from "@/lib/email";
import { excluirUsuario } from "@/lib/exclusao";
import { TAG_REDE } from "@/lib/posts";
import { eUuid } from "@/lib/rede";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { TAG_VETERINARIOS } from "@/lib/veterinarios";

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Toda ação do painel começa conferindo, no banco, se quem chama é admin.
async function exigirAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  if (!data) throw new Error("sem acesso ao painel");
  return supabase;
}

export type EstadoConvite = { ok?: boolean; erro?: string };

// Convite para quem está na lista de espera criar a conta. E-mail próprio
// (Resend), com link para /sou-veterinario: a pessoa cria a conta e aceita os
// termos ela mesma.
export async function enviarConvite(_anterior: EstadoConvite, form: FormData): Promise<EstadoConvite> {
  await exigirAdmin();
  const id = Number(form.get("id"));
  const admin = createAdminClient();
  const { data: inscrito } = await admin.from("vet_waitlist").select("id, nome, email").eq("id", id).maybeSingle();
  if (!inscrito) return { erro: "Inscrito não encontrado." };

  const link = `${SITE_URL}/sou-veterinario`;
  const primeiroNome = inscrito.nome.replace(/^Dra?\.\s+/i, "").split(" ")[0];
  // E-mail não lê CSS do site: cores do design system (primary) escritas à mão.
  try {
    await enviarEmail({
      para: inscrito.email,
      assunto: "Seu perfil no VetMeet: crie sua conta",
      texto: `Olá, ${primeiroNome}!\n\nVocê se inscreveu no VetMeet, a plataforma que ajuda tutores do Alto Tietê e da Zona Leste de São Paulo a encontrar veterinários.\n\nAgora cada profissional cuida do próprio perfil: crie sua conta para editar seus dados, adicionar foto, serviços e preços, pausar ou excluir quando quiser.\n\nCriar minha conta: ${link}\n\nUse este mesmo e-mail (${inscrito.email}) no cadastro.\n\nEquipe VetMeet`,
      html: `<p>Olá, ${escaparHtml(primeiroNome)}!</p>
<p>Você se inscreveu no VetMeet, a plataforma que ajuda tutores do Alto Tietê e da Zona Leste de São Paulo a encontrar veterinários.</p>
<p>Agora cada profissional cuida do próprio perfil: crie sua conta para editar seus dados, adicionar foto, serviços e preços, pausar ou excluir quando quiser.</p>
<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#1F6F5C;color:#ffffff;border-radius:12px;text-decoration:none;font-weight:600">Criar minha conta</a></p>
<p>Use este mesmo e-mail (${escaparHtml(inscrito.email)}) no cadastro.</p>
<p>Equipe VetMeet</p>`,
    });
  } catch (e) {
    console.error("convite:", e);
    return { erro: e instanceof Error && e.message.includes("RESEND_API_KEY") ? "Envio de e-mail não configurado." : "Falha ao enviar." };
  }

  await admin.from("vet_waitlist").update({ convidado_em: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
  return { ok: true };
}

type StatusDenuncia = Database["public"]["Enums"]["report_status"];

export async function atualizarDenuncia(form: FormData) {
  const supabase = await exigirAdmin();
  const status = String(form.get("status")) as StatusDenuncia;
  if (!["aberta", "analisada", "descartada"].includes(status)) return;
  // Com o RLS de admin, o próprio usuário logado altera (sem service role).
  await supabase.from("reports").update({ status }).eq("id", Number(form.get("id")));
  revalidatePath("/admin");
}

export type EstadoPerfilAdmin = { erro?: string };

// Tirar do ar (inativo: some da busca, do perfil público e da Rede; o
// veterinário não consegue reverter) ou pôr de volta no ar.
export async function alterarStatusPerfil(form: FormData) {
  await exigirAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!eUuid(id) || (status !== "ativo" && status !== "inativo")) return;
  // Service role: o trigger veterinarians_guard só trava a sessão do veterinário.
  const { error } = await createAdminClient().from("veterinarians").update({ status }).eq("id", id);
  if (error) console.error("status do perfil:", error.message);
  updateTag(TAG_VETERINARIOS);
  updateTag(TAG_REDE);
  revalidatePath("/admin");
}

// Exclui de vez. Com conta: apaga a conta (perfil, publicações e fotos vão
// junto) e a pessoa pode se cadastrar de novo. Sem conta (perfil publicado do
// pré-cadastro antigo): apaga só o perfil. Conta de admin nunca é apagada aqui.
export async function excluirPerfilAdmin(_anterior: EstadoPerfilAdmin, form: FormData): Promise<EstadoPerfilAdmin> {
  const supabase = await exigirAdmin();
  const vetId = String(form.get("vet_id") ?? "");
  const userIdForm = String(form.get("user_id") ?? "");
  const admin = createAdminClient();

  let userId: string | null = null;
  if (eUuid(vetId)) {
    const { data: vet } = await admin.from("veterinarians").select("id, user_id").eq("id", vetId).maybeSingle();
    if (!vet) return { erro: "Perfil não encontrado. Atualize a página." };
    userId = vet.user_id;
    if (!userId) {
      const { error } = await admin.from("veterinarians").delete().eq("id", vet.id);
      if (error) {
        console.error("excluir perfil:", error.message);
        return { erro: "Não foi possível excluir agora." };
      }
    }
  } else if (eUuid(userIdForm)) {
    userId = userIdForm;
  } else {
    return { erro: "Pedido inválido." };
  }

  if (userId) {
    const { data: alvo } = await admin.auth.admin.getUserById(userId);
    const email = alvo.user?.email?.toLowerCase();
    if (email) {
      const { data: eAdmin } = await admin.from("admins").select("email").eq("email", email).maybeSingle();
      const {
        data: { user: eu },
      } = await supabase.auth.getUser();
      if (eAdmin || eu?.id === userId) return { erro: "Contas de administrador não são excluídas pelo painel." };
    }
    const { error } = await excluirUsuario(admin, userId);
    if (error) {
      console.error("excluir conta (admin):", error.message);
      return { erro: "Não foi possível excluir agora." };
    }
  }

  updateTag(TAG_VETERINARIOS);
  updateTag(TAG_REDE);
  revalidatePath("/admin");
  return {};
}
