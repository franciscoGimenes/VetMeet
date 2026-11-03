import "server-only";

// Envio de e-mail pela API do Resend (sem SDK). Os e-mails de autenticação
// (confirmação, senha) não passam por aqui: são do Supabase Auth, pelo SMTP
// configurado no painel do Supabase.
export async function enviarEmail(msg: { para: string; assunto: string; html: string; texto: string }) {
  const chave = process.env.RESEND_API_KEY;
  const de = process.env.EMAIL_REMETENTE;
  if (!chave || !de) throw new Error("RESEND_API_KEY e EMAIL_REMETENTE não definidas (veja .env.example).");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: de, to: [msg.para], subject: msg.assunto, html: msg.html, text: msg.texto }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

export const escaparHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
