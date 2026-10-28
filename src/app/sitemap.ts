import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getCatalogos } from "@/lib/catalogos";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";
import { TAG_VETERINARIOS } from "@/lib/veterinarios";

// Perfis reais ativos. Demos ficam de fora: são noindex.
async function perfisReais() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_VETERINARIOS);
  const { data } = await createPublicClient()
    .from("veterinarians")
    .select("slug, updated_at")
    .eq("is_demo", false);
  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogos, perfis] = await Promise.all([getCatalogos(), perfisReais()]);
  const url = (caminho: string) => `${SITE_URL}${caminho}`;

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/buscar"), changeFrequency: "daily", priority: 0.9 },
    // Uma página de busca por cidade/subprefeitura (as mesmas que são indexáveis).
    ...catalogos.regioes.map((r) => ({
      url: url(`/buscar?local=${r.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...perfis.map((p) => ({
      url: url(`/vet/${p.slug}`),
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: url("/sou-veterinario"), changeFrequency: "monthly", priority: 0.5 },
  ];
}
