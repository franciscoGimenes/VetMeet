"use client";

import { useEffect } from "react";

// Última busca enviada nesta aba: evita contar duas vezes a mesma busca
// (remontagens, Strict Mode em dev, voltar e avançar no histórico).
let ultimaEnviada: string | null = null;

// Registra a busca só quando os resultados aparecem de fato para alguém.
// Renderizações no servidor (pré-carregamento de links, robôs) não contam.
export function RegistroBusca({ consulta }: { consulta: string }) {
  useEffect(() => {
    if (consulta === ultimaEnviada) return;
    ultimaEnviada = consulta;
    try {
      const corpo = new Blob([JSON.stringify({ consulta })], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/busca", corpo)) {
        fetch("/api/busca", { method: "POST", body: corpo, keepalive: true }).catch(() => {});
      }
    } catch {
      // registro é best-effort
    }
  }, [consulta]);

  return null;
}
