import type { MetadataRoute } from "next";
import { SITE_DESCRICAO, SITE_NOME } from "@/lib/site";
import { CORES } from "@/lib/tokens";

// Ícones para "Adicionar à tela inicial" (Android). Arquivos em public/brand.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NOME,
    short_name: SITE_NOME,
    description: SITE_DESCRICAO,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: CORES.background,
    theme_color: CORES.background,
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
