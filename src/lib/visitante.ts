import "server-only";
import { connection } from "next/server";
import type { Visitante } from "@/lib/rede";
import { createClient } from "@/lib/supabase/server";

// Quem está vendo a Rede. Sempre por requisição (lê cookies), dentro de <Suspense>.
export async function getVisitante(): Promise<Visitante> {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tipo: "visitante" };
  const { data } = await supabase.from("veterinarians").select("id, status").eq("user_id", user.id).maybeSingle();
  if (!data || data.status !== "ativo") return { tipo: "sem-perfil" };
  return { tipo: "veterinario", vetId: data.id, userId: user.id };
}

// Quais destes posts o veterinário logado curtiu.
export async function curtidosPor(visitante: Visitante, postIds: string[]) {
  if (visitante.tipo !== "veterinario" || !postIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("veterinarian_id", visitante.vetId)
    .in("post_id", postIds);
  return (data ?? []).map((l) => l.post_id);
}
