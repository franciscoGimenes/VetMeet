// Regras do pré-cadastro de veterinários. Funções puras: as mesmas regras
// valem no formulário (cliente) e na Server Action (servidor).

export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export type CampoPreCadastro =
  | "nome"
  | "crmv_numero"
  | "crmv_uf"
  | "whatsapp"
  | "email"
  | "cidade"
  | "especies"
  | "modalidades"
  | "consentimento";

export type ErrosPreCadastro = Partial<Record<CampoPreCadastro, string>>;

export type DadosPreCadastro = {
  nome: string;
  crmv_numero: string;
  crmv_uf: string;
  whatsapp: string;
  email: string;
  cidade: string;
  especies: string[];
  modalidades: string[];
  consentimento: boolean;
};

export type SlugsPermitidos = {
  cidades: string[];
  especies: string[];
  modalidades: string[];
};

// Aceita "(11) 98765-4321", "11987654321", "+55 11 98765-4321", "011 ...".
// Devolve no formato internacional usado pelo wa.me (55 + DDD + número) ou null.
export function normalizarWhatsApp(valor: string): string | null {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10 && d.length !== 11) return null;
  if (!/^[1-9]{2}/.test(d)) return null; // DDD
  const numero = d.slice(2);
  if (numero.length === 9 && numero[0] !== "9") return null; // celular começa com 9
  if (numero.length === 8 && !/^[2-5]/.test(numero)) return null; // fixo começa com 2 a 5
  return `55${d}`;
}

// "(11) 98765-4321" enquanto a pessoa digita.
export function mascararWhatsApp(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2); // colou com +55
  if (d.startsWith("0")) d = d.slice(1); // 0 + DDD
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Número de inscrição: só dígitos (pontos, espaços e hífen são ignorados), até 6.
export function normalizarCrmv(valor: string): string | null {
  const d = valor.replace(/[.\s-]/g, "");
  if (!/^\d{1,6}$/.test(d) || /^0+$/.test(d)) return null;
  return d.replace(/^0+/, "");
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarPreCadastro(
  dados: DadosPreCadastro,
  permitidos: SlugsPermitidos,
): { ok: true; valores: DadosPreCadastro } | { ok: false; erros: ErrosPreCadastro } {
  const erros: ErrosPreCadastro = {};

  const nome = dados.nome.trim().replace(/\s+/g, " ");
  if (nome.length < 3 || nome.length > 120 || !/\p{L}/u.test(nome)) {
    erros.nome = "Informe seu nome completo.";
  }

  const crmv = normalizarCrmv(dados.crmv_numero);
  if (!crmv) erros.crmv_numero = "Use só os números da inscrição (até 6 dígitos).";

  const uf = dados.crmv_uf.trim().toUpperCase();
  if (!(UFS as readonly string[]).includes(uf)) erros.crmv_uf = "Escolha a UF do CRMV.";

  const whatsapp = normalizarWhatsApp(dados.whatsapp);
  if (!whatsapp) erros.whatsapp = "Informe DDD e número, ex.: (11) 98765-4321.";

  const email = dados.email.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) erros.email = "Informe um e-mail válido.";

  if (!permitidos.cidades.includes(dados.cidade)) erros.cidade = "Escolha a cidade ou região onde atende.";

  const especies = [...new Set(dados.especies)].filter((e) => permitidos.especies.includes(e));
  if (!especies.length) erros.especies = "Marque ao menos uma espécie.";

  const modalidades = [...new Set(dados.modalidades)].filter((m) => permitidos.modalidades.includes(m));
  if (!modalidades.length) erros.modalidades = "Marque ao menos uma modalidade.";

  if (!dados.consentimento) erros.consentimento = "É preciso autorizar o uso dos dados para enviar.";

  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    valores: {
      nome,
      crmv_numero: crmv!,
      crmv_uf: uf,
      whatsapp: whatsapp!,
      email,
      cidade: dados.cidade,
      especies,
      modalidades,
      consentimento: true,
    },
  };
}

export function lerFormulario(form: FormData): DadosPreCadastro {
  const texto = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const lista = (k: string) => form.getAll(k).filter((v): v is string => typeof v === "string");
  return {
    nome: texto("nome"),
    crmv_numero: texto("crmv_numero"),
    crmv_uf: texto("crmv_uf"),
    whatsapp: texto("whatsapp"),
    email: texto("email"),
    cidade: texto("cidade"),
    especies: lista("especies"),
    modalidades: lista("modalidades"),
    consentimento: form.get("consentimento") === "sim",
  };
}

// "Dra. Ana Lúcia Souza" -> "dra-ana-lucia-souza" (endereço do perfil público).
export function slugDoNome(nome: string) {
  const slug = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "veterinario";
}

// Nome do campo-armadilha: invisível para pessoas, preenchido por robôs.
export const CAMPO_HONEYPOT = "empresa_site";
