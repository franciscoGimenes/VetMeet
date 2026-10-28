import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Só afeta `next dev`: libera o acesso pelo IP da rede local (ex.: testar no
  // celular em http://192.168.x.x:3000). Sem isso o Next bloqueia os scripts e
  // a página fica sem interatividade.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
