"use client";

import { CircleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Icon } from "@/components/ui";

// Aviso flutuante para falhas de ações sem formulário (curtir, apagar,
// carregar mais). Erros de formulário aparecem no próprio formulário.
const EVENTO = "vetmeet:aviso";
const DURACAO = 6000;

export function avisarErro(mensagem: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENTO, { detail: mensagem }));
}

export function Avisos() {
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);

  useEffect(() => {
    const ouvir = (e: Event) => setAviso({ id: Date.now(), texto: (e as CustomEvent<string>).detail });
    window.addEventListener(EVENTO, ouvir);
    return () => window.removeEventListener(EVENTO, ouvir);
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), DURACAO);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center">
      {aviso && (
        <div
          key={aviso.id}
          role="alert"
          className="pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-card bg-surface py-2 pr-2 pl-4 text-small text-text shadow-overlay ring-1 ring-error/30"
        >
          <Icon icon={CircleAlert} className="mt-3 text-error-strong" />
          <p className="min-w-0 flex-1 py-3">{aviso.texto}</p>
          <Button variant="ghost" iconOnly onClick={() => setAviso(null)} aria-label="Fechar aviso">
            <Icon icon={X} />
          </Button>
        </div>
      )}
    </div>
  );
}
