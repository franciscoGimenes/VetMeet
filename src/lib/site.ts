// URL pública do site, usada em metadados, sitemap e links de compartilhamento.
// Em produção defina NEXT_PUBLIC_SITE_URL (ex.: https://vetmeet.com.br); na
// Vercel, sem ela, usa o domínio de produção do projeto.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NOME = "VetMeet";

export const SITE_DESCRICAO =
  "Encontre médicos-veterinários com clínica própria, atendimento em casa ou teleorientação no Alto Tietê e na Zona Leste de São Paulo.";

// E-mail de contato do projeto, mostrado no rodapé. Sem ele, o rodapé não mostra
// a linha de contato.
export const CONTATO_EMAIL = process.env.NEXT_PUBLIC_CONTATO_EMAIL || undefined;
