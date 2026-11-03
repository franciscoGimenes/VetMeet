"use server";

import { redirect } from "next/navigation";
import { urlCallback } from "@/lib/auth";
import { etapaDaConta } from "@/lib/conta";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SENHA_MIN } from "@/lib/senha";
import { PRIVACIDADE_VERSAO, TERMOS_VERSAO } from "@/lib/termos";

export type EstadoAuth = {
  erro?: string;
  erros?: Partial<Record<"email" | "senha" | "declaracao" | "termos", string>>;
  enviado?: boolean;
  email?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FALHA = "Não foi possível concluir agora. Tente novamente em alguns minutos.";

const texto = (form: FormData, k: string) => String(form.get(k) ?? "").trim();

export async function entrar(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = texto(form, "email").toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (!EMAIL.test(email) || !senha) {
    return { erro: "Informe e-mail e senha.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar.", email };
    }
    if (error.code === "invalid_credentials") return { erro: "E-mail ou senha incorretos.", email };
    console.error("entrar:", error.code, error.message);
    return { erro: FALHA, email };
  }
  // Direto para a etapa que falta (aceite, montar perfil ou o painel da conta).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const etapa = user ? await etapaDaConta({ supabase, user }) : "/conta";
  redirect(typeof etapa === "string" ? etapa : "/conta");
}

export async function criarConta(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = texto(form, "email").toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const erros: EstadoAuth["erros"] = {};
  if (!EMAIL.test(email) || email.length > 254) erros.email = "Informe um e-mail válido.";
  if (senha.length < SENHA_MIN) erros.senha = `Use pelo menos ${SENHA_MIN} caracteres.`;
  if (form.get("declaracao") !== "sim") erros.declaracao = "Confirme a declaração para continuar.";
  if (form.get("termos") !== "sim") erros.termos = "Aceite os Termos de Uso e a Política de Privacidade.";
  if (Object.keys(erros).length) return { erros, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { emailRedirectTo: await urlCallback("/conta") },
  });
  if (error) {
    if (error.code === "weak_password") return { erros: { senha: "Senha fraca ou já vazada. Escolha outra." }, email };
    if (error.code === "over_email_send_rate_limit") {
      return { erro: "Muitos cadastros em pouco tempo. Tente de novo daqui a alguns minutos.", email };
    }
    console.error("criar conta:", error.code, error.message);
    return { erro: FALHA, email };
  }

  // Aceite registrado já no cadastro. E-mail que já tem conta volta sem
  // identidades (o Supabase não revela que existe); aí não há o que gravar.
  if (data.user && data.user.identities?.length) {
    const { error: erroAceite } = await createAdminClient().from("vet_consents").insert({
      user_id: data.user.id,
      termos_versao: TERMOS_VERSAO,
      privacidade_versao: PRIVACIDADE_VERSAO,
      declaracao_crmv: true,
    });
    if (erroAceite) console.error("aceite no cadastro:", erroAceite.message);
  }

  // Sem confirmação de e-mail ligada no Supabase, a sessão já vem pronta.
  if (data.session) redirect("/conta");
  return { enviado: true, email };
}

export async function entrarComLinkedIn() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: { redirectTo: await urlCallback("/conta"), scopes: "openid profile email" },
  });
  if (error || !data.url) {
    console.error("linkedin:", error?.message);
    redirect("/entrar?erro=linkedin");
  }
  redirect(data.url);
}

export async function recuperarSenha(_anterior: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = texto(form, "email").toLowerCase();
  if (!EMAIL.test(email)) return { erros: { email: "Informe um e-mail válido." }, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await urlCallback("/conta/nova-senha"),
  });
  if (error && error.code !== "user_not_found") {
    console.error("recuperar senha:", error.code, error.message);
    if (error.code === "over_email_send_rate_limit") {
      return { erro: "Pedimos muitos e-mails em pouco tempo. Tente de novo daqui a alguns minutos.", email };
    }
    return { erro: FALHA, email };
  }
  // Mesma resposta com ou sem conta: a página não revela quem está cadastrado.
  return { enviado: true, email };
}
