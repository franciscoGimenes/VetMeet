import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PRIVACIDADE_VERSAO, TERMOS_VERSAO } from "@/lib/termos";
import { mapear, SELECT_VET } from "@/lib/veterinarios";

export const BUCKET_FOTOS = "fotos-veterinarios";

// Sessão obrigatória (o proxy já barra quem não está logado; isto cobre a
// sessão que expirou entre o proxy e a página).
export async function exigirSessao() {
  // Sempre por requisição: o client do Supabase lê o relógio (validade do
  // token), o que o Cache Components não aceita num pré-render.
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

type Sessao = Awaited<ReturnType<typeof exigirSessao>>;

export async function temAceiteAtual({ supabase, user }: Sessao) {
  const { data } = await supabase
    .from("vet_consents")
    .select("id")
    .eq("user_id", user.id)
    .eq("termos_versao", TERMOS_VERSAO)
    .eq("privacidade_versao", PRIVACIDADE_VERSAO)
    .limit(1);
  return Boolean(data?.length);
}

export async function getMeuPerfil({ supabase, user }: Sessao) {
  const { data, error } = await supabase.from("veterinarians").select(SELECT_VET).eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(`Falha ao carregar seu perfil: ${error.message}`);
  return data ? mapear(data) : null;
}

// Quem entrou pelo pré-cadastro antigo já tem perfil publicado, sem conta.
// Ao criar a conta com o mesmo e-mail (confirmado), o perfil passa a ser dela.
export async function reivindicarPerfilDoPreCadastro({ user }: Sessao) {
  if (!user.email || !user.email_confirmed_at) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("vet_waitlist")
    .select("veterinarian_id, veterinarians!inner(id, user_id, is_demo)")
    .eq("email", user.email.toLowerCase())
    .not("veterinarian_id", "is", null)
    .is("veterinarians.user_id", null)
    .eq("veterinarians.is_demo", false)
    .order("created_at", { ascending: false })
    .limit(1);
  const id = data?.[0]?.veterinarian_id;
  if (!id) return false;
  const { error } = await admin.from("veterinarians").update({ user_id: user.id }).eq("id", id).is("user_id", null);
  if (error) {
    console.error("reivindicar perfil:", error.message);
    return false;
  }
  return true;
}

// Caminho de onde o veterinário deve estar, conforme o que falta na conta.
export async function etapaDaConta(sessao: Sessao) {
  if (!(await temAceiteAtual(sessao))) return "/conta/aceite";
  let perfil = await getMeuPerfil(sessao);
  if (!perfil && (await reivindicarPerfilDoPreCadastro(sessao))) perfil = await getMeuPerfil(sessao);
  return perfil ? { perfil } : "/conta/perfil";
}
