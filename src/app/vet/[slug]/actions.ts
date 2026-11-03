"use server";

import { CAMPO_HONEYPOT, DESCRICAO_DENUNCIA_MAX, MOTIVOS_DENUNCIA, type MotivoDenuncia } from "@/lib/denuncia";
import { hashDoIp } from "@/lib/ip";
import { createAdminClient } from "@/lib/supabase/admin";

export type EstadoDenuncia = { enviado?: boolean; erro?: string; erroMotivo?: string };

const LIMITE_POR_HORA = 5;

// Denúncia sem login. Gravada só pelo servidor (service role), depois do
// honeypot e do limite por IP; o público não tem insert na tabela reports.
export async function enviarDenuncia(_anterior: EstadoDenuncia, form: FormData): Promise<EstadoDenuncia> {
  if (String(form.get(CAMPO_HONEYPOT) ?? "").trim()) return { enviado: true };

  const vetId = String(form.get("veterinarian_id") ?? "");
  const motivo = String(form.get("motivo") ?? "") as MotivoDenuncia;
  const descricao = String(form.get("descricao") ?? "").trim();
  if (!MOTIVOS_DENUNCIA.some((m) => m.slug === motivo)) return { erroMotivo: "Escolha um motivo." };
  if (descricao.length > DESCRICAO_DENUNCIA_MAX) {
    return { erro: `Use até ${DESCRICAO_DENUNCIA_MAX} caracteres na descrição.` };
  }
  if (!/^[0-9a-f-]{36}$/.test(vetId)) return { erro: "Perfil não encontrado." };

  const admin = createAdminClient();
  const ipHash = await hashDoIp();
  const { count } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if ((count ?? 0) >= LIMITE_POR_HORA) {
    return { erro: "Recebemos muitas denúncias desta conexão. Tente de novo daqui a uma hora." };
  }

  const { error } = await admin.from("reports").insert({
    veterinarian_id: vetId,
    motivo,
    descricao: descricao || null,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("denúncia:", error.code, error.message);
    return { erro: "Não foi possível enviar agora. Tente novamente em alguns minutos." };
  }
  return { enviado: true };
}
