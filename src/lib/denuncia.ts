// Motivos de denúncia (enum report_motivo no banco), na ordem em que aparecem.
export const MOTIVOS_DENUNCIA = [
  { slug: "informacao_falsa", nome: "Informações falsas ou enganosas" },
  { slug: "crmv_irregular", nome: "CRMV inexistente, de outra pessoa ou irregular" },
  { slug: "conduta_inadequada", nome: "Conduta inadequada no atendimento" },
  { slug: "golpe_ou_cobranca_indevida", nome: "Golpe ou cobrança indevida" },
  { slug: "conteudo_improprio", nome: "Foto ou texto impróprio" },
  { slug: "outro", nome: "Outro motivo" },
] as const;

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]["slug"];

export const DESCRICAO_DENUNCIA_MAX = 1000;
export const CAMPO_HONEYPOT = "empresa_site";
