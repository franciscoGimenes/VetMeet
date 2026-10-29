import { getCatalogos } from "@/lib/catalogos";
import { createClient } from "@/lib/supabase/server";

// Exporta o pré-cadastro em CSV no formato que o Excel em português abre
// direto: separador ";" e UTF-8 com BOM.

const SEP = ";";

function celula(valor: unknown) {
  let texto = valor == null ? "" : String(valor);
  // Evita injeção de fórmula ao abrir no Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const { data: admin } = await supabase.rpc("is_admin");
  if (!admin) return new Response("Sem acesso", { status: 403 });

  const [{ data, error }, catalogos] = await Promise.all([
    supabase
      .from("vet_waitlist")
      .select("created_at, nome, crmv_numero, crmv_uf, whatsapp, email, especies, modalidades, regioes")
      .order("created_at", { ascending: true }),
    getCatalogos(),
  ]);
  if (error) return new Response("Erro ao exportar", { status: 500 });

  const nomes = (slugs: string[], itens: { slug: string; nome: string }[]) =>
    slugs.map((s) => itens.find((i) => i.slug === s)?.nome ?? s).join(", ");

  const linhas = [
    ["Data", "Nome", "CRMV", "UF", "WhatsApp", "E-mail", "Cidades", "Espécies", "Modalidades"],
    ...(data ?? []).map((c) => [
      new Date(c.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      c.nome,
      c.crmv_numero,
      c.crmv_uf,
      c.whatsapp,
      c.email,
      nomes(c.regioes, catalogos.regioes),
      nomes(c.especies, catalogos.especies),
      nomes(c.modalidades, catalogos.modos),
    ]),
  ];
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(SEP)).join("\r\n");
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vetmeet-pre-cadastro-${hoje}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
