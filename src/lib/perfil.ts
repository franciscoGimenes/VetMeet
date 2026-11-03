// Formulário "Meu perfil": leitura e validação. Funções puras: as mesmas
// regras valem no navegador (antes de enviar) e na Server Action.
import type { Catalogos } from "@/lib/catalogos";
import { lerNumeroCrmv, UFS } from "@/lib/crmv";
import type { Veterinario } from "@/lib/veterinarios";
import { mascararWhatsApp, normalizarWhatsApp } from "@/lib/whatsapp";

export const DISPONIBILIDADE_PERFIL = [
  { slug: "emergencia", nome: "Emergência", coluna: "atende_emergencia" },
  { slug: "fim-de-semana", nome: "Fim de semana", coluna: "atende_fim_de_semana" },
  { slug: "noturno", nome: "Noturno", coluna: "atende_noturno" },
] as const;

export const BIO_MAX = 1500;

export type LocalForm = { nome: string; endereco: string; regiao: string; bairro: string };

// O que vem do formulário, ainda como texto.
export type DadosPerfil = {
  nome: string;
  crmv_numero: string;
  crmv_uf: string;
  crmv_secundaria: boolean;
  whatsapp: string;
  instagram: string;
  anos_experiencia: string;
  bio: string;
  consulta_min: string;
  consulta_max: string;
  disp: string[];
  especies: string[];
  areas: string[];
  area_principal: string;
  servicos: string[];
  servico_min: Record<string, string>;
  servico_max: Record<string, string>;
  pagamentos: string[];
  parcelas_max: string;
  modos: string[];
  cobertura: string[];
  locais: LocalForm[];
};

export type CampoPerfil =
  | "nome"
  | "crmv_numero"
  | "crmv_uf"
  | "whatsapp"
  | "instagram"
  | "anos_experiencia"
  | "bio"
  | "consulta"
  | "especies"
  | "areas"
  | "servicos"
  | "parcelas_max"
  | "modos"
  | "cobertura"
  | "locais";

export type ErrosPerfil = Partial<Record<CampoPerfil, string>>;

// O que vai para public.salvar_meu_perfil.
export type PerfilPayload = {
  nome: string;
  crmv_numero: string;
  crmv_uf: string;
  crmv_secundaria: boolean;
  whatsapp: string;
  instagram: string | null;
  anos_experiencia: number | null;
  bio: string | null;
  consulta_preco_min: number | null;
  consulta_preco_max: number | null;
  atende_emergencia: boolean;
  atende_fim_de_semana: boolean;
  atende_noturno: boolean;
  especies: string[];
  areas: string[];
  area_principal: string | null;
  servicos: { slug: string; preco_min: number | null; preco_max: number | null }[];
  pagamentos: { slug: string; parcelas_max: number | null }[];
  modos: string[];
  cobertura: string[];
  locais: { nome: string; endereco: string | null; regiao: string; bairro: string | null }[];
};

// "R$ 1.250,50" / "1250.5" / "180" -> número; "" -> null; inválido -> NaN.
export function lerPreco(valor: string): number | null {
  const t = valor.replace(/R\$|\s/g, "");
  if (!t) return null;
  const normal = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return NaN;
  return Number(normal);
}

// "@ana.vet", "instagram.com/ana.vet/" -> "ana.vet"
export function lerInstagram(valor: string): string | null {
  const t = valor
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  return t || null;
}

const PRECO_TETO = 100000;

function faixa(min: string, max: string): { ok: true; min: number | null; max: number | null } | { ok: false } {
  let a = lerPreco(min);
  let b = lerPreco(max);
  if (Number.isNaN(a) || Number.isNaN(b)) return { ok: false };
  if (a == null && b != null) a = b;
  if (b == null && a != null) b = a;
  if (a != null && b != null && (a > b || b > PRECO_TETO)) return { ok: false };
  return { ok: true, min: a, max: b };
}

export function validarPerfil(
  dados: DadosPerfil,
  catalogos: Pick<Catalogos, "regioes" | "bairros" | "especies" | "areas" | "servicos" | "modos" | "pagamentos">,
): { ok: true; payload: PerfilPayload } | { ok: false; erros: ErrosPerfil } {
  const erros: ErrosPerfil = {};
  const slugs = (itens: { slug: string }[]) => new Set(itens.map((i) => i.slug));
  const filtrar = (lista: string[], itens: { slug: string }[]) => {
    const validos = slugs(itens);
    return [...new Set(lista)].filter((s) => validos.has(s));
  };

  const nome = dados.nome.trim().replace(/\s+/g, " ");
  if (nome.length < 3 || nome.length > 120 || !/\p{L}/u.test(nome)) {
    erros.nome = "Informe o nome que vai aparecer no perfil.";
  }

  const crmv = lerNumeroCrmv(dados.crmv_numero);
  if (!crmv) erros.crmv_numero = "Use só os números da inscrição (até 6), com S no fim se for secundária.";
  const uf = dados.crmv_uf.trim().toUpperCase();
  if (!(UFS as readonly string[]).includes(uf)) erros.crmv_uf = "Escolha a UF do CRMV.";

  const whatsapp = normalizarWhatsApp(dados.whatsapp);
  if (!whatsapp) erros.whatsapp = "Informe DDD e número, ex.: (11) 98765-4321.";

  const instagram = lerInstagram(dados.instagram);
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
    erros.instagram = "Use só o nome de usuário, ex.: @clinica.exemplo.";
  }

  let anos: number | null = null;
  if (dados.anos_experiencia.trim()) {
    anos = Number(dados.anos_experiencia);
    if (!Number.isInteger(anos) || anos < 0 || anos > 70) erros.anos_experiencia = "Informe um número entre 0 e 70.";
  }

  const bio = dados.bio.trim();
  if (bio.length > BIO_MAX) erros.bio = `Use até ${BIO_MAX} caracteres (agora são ${bio.length}).`;

  const consulta = faixa(dados.consulta_min, dados.consulta_max);
  if (!consulta.ok) erros.consulta = "Confira os valores: o mínimo não pode passar do máximo.";

  const especies = filtrar(dados.especies, catalogos.especies);
  if (!especies.length) erros.especies = "Marque ao menos uma espécie.";

  const areas = filtrar(dados.areas, catalogos.areas);
  const principal = areas.includes(dados.area_principal) ? dados.area_principal : (areas[0] ?? null);

  const servicos: PerfilPayload["servicos"] = [];
  for (const slug of filtrar(dados.servicos, catalogos.servicos)) {
    const f = faixa(dados.servico_min[slug] ?? "", dados.servico_max[slug] ?? "");
    if (!f.ok) {
      erros.servicos = "Confira os preços dos serviços: o mínimo não pode passar do máximo.";
      continue;
    }
    servicos.push({ slug, preco_min: f.min, preco_max: f.max });
  }

  const pagamentosSlugs = filtrar(dados.pagamentos, catalogos.pagamentos);
  let parcelas: number | null = null;
  if (pagamentosSlugs.includes("parcelamento") && dados.parcelas_max.trim()) {
    parcelas = Number(dados.parcelas_max);
    if (!Number.isInteger(parcelas) || parcelas < 2 || parcelas > 24) {
      erros.parcelas_max = "Informe de 2 a 24 parcelas.";
    }
  }
  const pagamentos = pagamentosSlugs.map((slug) => ({
    slug,
    parcelas_max: slug === "parcelamento" ? parcelas : null,
  }));

  const modos = filtrar(dados.modos, catalogos.modos);
  if (!modos.length) erros.modos = "Marque ao menos uma forma de atendimento.";

  const cobertura = modos.includes("domiciliar") ? filtrar(dados.cobertura, catalogos.regioes) : [];
  if (modos.includes("domiciliar") && !cobertura.length) {
    erros.cobertura = "Marque as cidades ou regiões onde faz atendimento em casa.";
  }

  const locais: PerfilPayload["locais"] = [];
  if (modos.includes("clinica_propria")) {
    for (const l of dados.locais) {
      const nomeLocal = l.nome.trim().replace(/\s+/g, " ");
      const endereco = l.endereco.trim().replace(/\s+/g, " ");
      const regiao = catalogos.regioes.find((r) => r.slug === l.regiao);
      if (!nomeLocal && !endereco && !l.regiao) continue; // linha em branco
      if (!regiao || nomeLocal.length < 2 || nomeLocal.length > 120 || endereco.length > 200) {
        erros.locais = "Cada local precisa de nome e cidade.";
        continue;
      }
      const bairro = catalogos.bairros.find((b) => b.region_id === regiao.id && b.slug === l.bairro);
      locais.push({ nome: nomeLocal, endereco: endereco || null, regiao: regiao.slug, bairro: bairro?.slug ?? null });
    }
    if (!locais.length && !erros.locais) erros.locais = "Informe ao menos um local de atendimento.";
    if (locais.length > 10) erros.locais = "Informe até 10 locais.";
  }

  if (Object.keys(erros).length || !consulta.ok) return { ok: false, erros };

  const disp = new Set(dados.disp);
  return {
    ok: true,
    payload: {
      nome,
      crmv_numero: crmv!.numero,
      crmv_uf: uf,
      crmv_secundaria: crmv!.secundaria || dados.crmv_secundaria,
      whatsapp: whatsapp!,
      instagram,
      anos_experiencia: anos,
      bio: bio || null,
      consulta_preco_min: consulta.min,
      consulta_preco_max: consulta.max,
      atende_emergencia: disp.has("emergencia"),
      atende_fim_de_semana: disp.has("fim-de-semana"),
      atende_noturno: disp.has("noturno"),
      especies,
      areas,
      area_principal: principal,
      servicos,
      pagamentos,
      modos,
      cobertura,
      locais,
    },
  };
}

export function lerFormularioPerfil(form: FormData): DadosPerfil {
  const texto = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const lista = (k: string) => form.getAll(k).filter((v): v is string => typeof v === "string");
  const porServico = (prefixo: string) => {
    const r: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      if (k.startsWith(prefixo) && typeof v === "string") r[k.slice(prefixo.length)] = v;
    }
    return r;
  };
  const nomes = lista("local_nome");
  const enderecos = lista("local_endereco");
  const regioes = lista("local_regiao");
  const bairros = lista("local_bairro");

  return {
    nome: texto("nome"),
    crmv_numero: texto("crmv_numero"),
    crmv_uf: texto("crmv_uf"),
    crmv_secundaria: form.get("crmv_secundaria") === "sim",
    whatsapp: texto("whatsapp"),
    instagram: texto("instagram"),
    anos_experiencia: texto("anos_experiencia"),
    bio: texto("bio"),
    consulta_min: texto("consulta_min"),
    consulta_max: texto("consulta_max"),
    disp: lista("disp"),
    especies: lista("especies"),
    areas: lista("areas"),
    area_principal: texto("area_principal"),
    servicos: lista("servicos"),
    servico_min: porServico("servico_min."),
    servico_max: porServico("servico_max."),
    pagamentos: lista("pagamentos"),
    parcelas_max: texto("parcelas_max"),
    modos: lista("modos"),
    cobertura: lista("cobertura"),
    locais: nomes.map((nome, i) => ({
      nome,
      endereco: enderecos[i] ?? "",
      regiao: regioes[i] ?? "",
      bairro: bairros[i] ?? "",
    })),
  };
}

const preco = (v: number | null) => (v == null ? "" : String(v).replace(".", ","));

// Valores iniciais: o perfil salvo ou, no primeiro acesso, só o nome (vindo do LinkedIn).
export function dadosDoPerfil(vet: Veterinario | null, nomeSugerido = ""): DadosPerfil {
  if (!vet) {
    return {
      nome: nomeSugerido, crmv_numero: "", crmv_uf: "SP", crmv_secundaria: false, whatsapp: "", instagram: "",
      anos_experiencia: "", bio: "", consulta_min: "", consulta_max: "", disp: [], especies: [], areas: [],
      area_principal: "", servicos: [], servico_min: {}, servico_max: {}, pagamentos: [], parcelas_max: "",
      modos: [], cobertura: [], locais: [],
    };
  }
  return {
    nome: vet.nome,
    crmv_numero: vet.crmvDados.numero,
    crmv_uf: vet.crmvDados.uf,
    crmv_secundaria: vet.crmvDados.secundaria,
    whatsapp: vet.whatsapp ? mascararWhatsApp(vet.whatsapp) : "",
    instagram: vet.instagram ?? "",
    anos_experiencia: vet.anosExperiencia?.toString() ?? "",
    bio: vet.bio ?? "",
    consulta_min: preco(vet.consulta.min),
    consulta_max: preco(vet.consulta.max),
    disp: [vet.emergencia && "emergencia", vet.fimDeSemana && "fim-de-semana", vet.noturno && "noturno"].filter(
      (d): d is string => Boolean(d),
    ),
    especies: vet.especies.map((e) => e.slug),
    areas: vet.areas.map((a) => a.slug),
    area_principal: vet.areas.find((a) => a.principal)?.slug ?? "",
    servicos: vet.servicos.map((s) => s.slug),
    servico_min: Object.fromEntries(vet.servicos.map((s) => [s.slug, preco(s.min)])),
    servico_max: Object.fromEntries(vet.servicos.map((s) => [s.slug, preco(s.max)])),
    pagamentos: vet.pagamentos.map((p) => p.slug),
    parcelas_max: vet.pagamentos.find((p) => p.slug === "parcelamento")?.parcelasMax?.toString() ?? "",
    modos: vet.modos.map((m) => m.slug),
    cobertura: vet.cobertura.map((c) => c.slug),
    locais: vet.locais.map((l) => ({
      nome: l.nome,
      endereco: l.endereco ?? "",
      regiao: l.regiao.slug,
      bairro: l.bairro?.slug ?? "",
    })),
  };
}
