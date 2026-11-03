import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

// HMAC do IP de quem fez a requisição, para limites de envio por hora.
// Com segredo do servidor: o IP nunca é guardado em claro.
export async function hashDoIp() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "desconhecido";
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(ip).digest("hex");
}
