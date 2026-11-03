"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { enviarEmail, escaparHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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
