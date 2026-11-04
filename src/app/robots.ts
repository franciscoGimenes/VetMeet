import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/auth/", "/conta", "/entrar", "/rede/novo", "/rede/post/*/editar"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
