"use server";

import { urlCallback } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { enviado?: boolean; erro?: string; email?: string };

// E-mails autorizados a pedir o link (o banco confere de novo via tabela admins).
function emailsAdmin() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function enviarLink(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { erro: "Informe um e-mail válido.", email };
  }

  // Para e-mails fora da lista não enviamos nada, mas a resposta é a mesma:
  // assim a página não revela quem é admin.
  if (emailsAdmin().includes(email)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: await urlCallback("/admin") },
    });
    if (error) {
      console.error("login admin:", error.message);
      return { erro: "Não foi possível enviar o link agora. Tente de novo em alguns minutos.", email };
    }
  }

  return { enviado: true, email };
}
