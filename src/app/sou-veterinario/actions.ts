"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCatalogos } from "@/lib/catalogos";
import {
  CAMPO_HONEYPOT,
  lerFormulario,
  validarPreCadastro,
  type DadosPreCadastro,
  type ErrosPreCadastro,
} from "@/lib/precadastro";
import { createAdminClient } from "@/lib/supabase/admin";

export type EstadoPreCadastro = {
  erros?: ErrosPreCadastro;
  mensagem?: string;
  valores?: DadosPreCadastro;
};

const LIMITE_POR_HORA = 5;
const FALHA = "Não foi possível enviar agora. Tente novamente em alguns minutos.";

async function hashDoIp() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "desconhecido";
  // HMAC com segredo do servidor: o IP nunca é guardado em claro.
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(ip).digest("hex");
}

export async function enviarPreCadastro(
  _anterior: EstadoPreCadastro,
  form: FormData,
): Promise<EstadoPreCadastro> {
  // Robô preencheu o campo invisível: responde como sucesso e não grava nada.
  if (String(form.get(CAMPO_HONEYPOT) ?? "").trim()) redirect("/sou-veterinario/confirmado");

  const dados = lerFormulario(form);
  const catalogos = await getCatalogos();
  const validacao = validarPreCadastro(dados, {
    cidades: catalogos.regioes.map((r) => r.slug),
    especies: catalogos.especies.map((e) => e.slug),
    modalidades: catalogos.modos.map((m) => m.slug),
  });
  if (!validacao.ok) return { erros: validacao.erros, valores: dados };
  const v = validacao.valores;

  let admin;
  try {
    admin = createAdminClient();
  } catch (erro) {
    console.error("pré-cadastro:", erro);
    return { mensagem: FALHA, valores: dados };
  }

  const { data: permitido, error: erroLimite } = await admin.rpc("pre_cadastro_permitido", {
    p_ip_hash: await hashDoIp(),
    p_limite: LIMITE_POR_HORA,
    p_janela_minutos: 60,
  });
  if (erroLimite) {
    console.error("pré-cadastro (limite):", erroLimite.message);
    return { mensagem: FALHA, valores: dados };
  }
  if (!permitido) {
    return {
      mensagem: "Recebemos muitos envios desta conexão. Tente de novo daqui a uma hora.",
      valores: dados,
    };
  }

  const { error } = await admin.from("vet_waitlist").insert({
    nome: v.nome,
    crmv_numero: v.crmv_numero,
    crmv_uf: v.crmv_uf,
    whatsapp: v.whatsapp,
    email: v.email,
    region_id: catalogos.regioes.find((r) => r.slug === v.cidade)!.id,
    especies: v.especies,
    modalidades: v.modalidades,
    consentimento_lgpd: true,
  });
  if (error) {
    console.error("pré-cadastro (insert):", error.message);
    return { mensagem: FALHA, valores: dados };
  }

  redirect("/sou-veterinario/confirmado");
}
