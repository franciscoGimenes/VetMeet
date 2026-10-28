"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import type { EventoContato } from "@/lib/contato";

// Registra o clique sem bloquear nem atrasar a abertura do link: sendBeacon
// sobrevive à navegação; se não existir ou falhar, cai para fetch keepalive.
// Qualquer erro é engolido para nunca impedir o contato.
function registrarContato(evento: EventoContato) {
  try {
    const corpo = JSON.stringify(evento);
    const blob = new Blob([corpo], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/contato", blob)) return;
    fetch("/api/contato", {
      method: "POST",
      body: corpo,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // registro é best-effort
  }
}

// Recebe as classes prontas (de buttonClasses) porque precisa ser <a> ou <button>
// conforme o perfil seja real ou demo.
export function BotaoContato({
  evento,
  href,
  demo,
  className,
  children,
}: {
  evento: EventoContato;
  href: string;
  demo: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [aviso, setAviso] = useState(false);

  // Em perfis demo o link real nem chega ao navegador (o chamador passa href vazio).
  if (demo) {
    return (
      <>
        <button
          type="button"
          className={className}
          onClick={() => {
            registrarContato(evento);
            setAviso(true);
          }}
        >
          {children}
        </button>
        {aviso && <AvisoDemo canal={evento.canal} onFechar={() => setAviso(false)} />}
      </>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => registrarContato(evento)}
    >
      {children}
    </a>
  );
}

const TEXTO_CANAL: Record<EventoContato["canal"], string> = {
  whatsapp:
    "Nos perfis reais, este botão abre uma conversa no WhatsApp com a mensagem já escrita.",
  instagram: "Nos perfis reais, este botão abre o Instagram do profissional.",
  maps: "O endereço também é fictício. Nos perfis reais, este botão abre o local no Google Maps.",
};

function AvisoDemo({
  canal,
  onFechar,
}: {
  canal: EventoContato["canal"];
  onFechar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      aria-labelledby="aviso-demo-titulo"
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-card bg-surface p-0 text-left text-text shadow-overlay backdrop:bg-text/50"
    >
      <div className="p-6">
        <h2 id="aviso-demo-titulo" className="text-h3 text-text">
          Perfil de demonstração
        </h2>
        <p className="mt-2 text-small text-text-muted">
          Este profissional é fictício e foi criado para mostrar como o VetMeet funciona.
          Por isso, nenhum contato é enviado.
        </p>
        <p className="mt-2 text-small text-text-muted">{TEXTO_CANAL[canal]}</p>
        <form method="dialog" className="mt-6 flex justify-end">
          <Button type="submit">Entendi</Button>
        </form>
      </div>
    </dialog>
  );
}
