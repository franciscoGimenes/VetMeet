"use client";

import { useEffect, useRef, type RefObject } from "react";

// Leva a tela até o primeiro campo inválido ou mensagem de erro dentro de
// `raiz`; sem isso, até o alerta geral. Devolve false se não achou nada.
export function irParaErro(raiz: HTMLElement | null) {
  const alvo =
    raiz?.querySelector<HTMLElement>('[aria-invalid="true"], [data-erro]') ??
    raiz?.querySelector<HTMLElement>('[role="alert"]');
  if (!alvo) return false;
  const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  alvo.scrollIntoView({ block: "center", behavior: suave ? "smooth" : "auto" });
  alvo.focus({ preventScroll: true });
  return true;
}

// Depois que o servidor responde com erro, leva a tela até ele. Em formulários
// longos o botão de enviar fica longe dos campos (barra fixa no celular) e a
// mensagem passava despercebida: parecia que nada tinha acontecido.
export function useMostrarErro(estado: unknown, raiz: RefObject<HTMLElement | null>) {
  const inicial = useRef(estado);
  useEffect(() => {
    // Só depois de uma resposta, não ao abrir a página.
    if (estado !== inicial.current) irParaErro(raiz.current);
  }, [estado, raiz]);
}
