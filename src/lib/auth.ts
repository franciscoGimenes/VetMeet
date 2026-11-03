import "server-only";
import { headers } from "next/headers";

// Endereço do site que recebeu a requisição (local, prévia da Vercel ou
// produção). Os links dos e-mails de autenticação voltam para ele; o Supabase
// só aceita os que estão em Authentication > URL Configuration > Redirect URLs.
export async function origem() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

// Link de volta para /auth/callback, que troca o código pela sessão e segue para `destino`.
export async function urlCallback(destino: string) {
  return `${await origem()}/auth/callback?next=${encodeURIComponent(destino)}`;
}

// Só caminhos internos: impede usar o callback para mandar a pessoa a outro site.
export function destinoSeguro(valor: string | null, padrao = "/conta") {
  return valor && /^\/(?!\/)[\w\-/?=&.%]*$/.test(valor) ? valor : padrao;
}
