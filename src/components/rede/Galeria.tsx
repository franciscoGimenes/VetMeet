"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FotoPost } from "@/lib/rede";

// Miniaturas do post (1 foto: inteira; 2 ou 4: duas colunas; 3, 5 ou 6: três
// colunas) e visualização ampliada em tela cheia.
export function Galeria({ fotos, autor }: { fotos: FotoPost[]; autor: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  if (!fotos.length) return null;
  const unica = fotos.length === 1;
  const colunas = unica ? "" : fotos.length === 2 || fotos.length === 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <>
      <div className={cn("grid gap-1 overflow-hidden rounded-control", colunas)}>
        {fotos.map((f, i) => (
          <button
            key={f.caminho}
            type="button"
            onClick={() => setAberta(i)}
            className="block overflow-hidden bg-sage-100"
            aria-label={`Ampliar foto ${i + 1} de ${fotos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- fotos do Storage, já reduzidas no envio */}
            <img
              src={f.url}
              alt=""
              width={f.largura}
              height={f.altura}
              loading="lazy"
              decoding="async"
              // A proporção vem da foto (dado, não estilo): evita o salto de layout.
              style={unica ? { aspectRatio: `${f.largura} / ${f.altura}` } : undefined}
              className={cn("w-full object-cover", unica ? "max-h-112" : "aspect-square")}
            />
          </button>
        ))}
      </div>
      {aberta !== null && <Ampliada fotos={fotos} inicial={aberta} autor={autor} onClose={() => setAberta(null)} />}
    </>
  );
}

function Ampliada({
  fotos,
  inicial,
  autor,
  onClose,
}: {
  fotos: FotoPost[];
  inicial: number;
  autor: string;
  onClose: () => void;
}) {
  const [atual, setAtual] = useState(inicial);
  const tituloId = useId();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const total = fotos.length;
  const ir = useCallback((passo: number) => setAtual((i) => (i + passo + total) % total), [total]);

  useEffect(() => {
    const origem = document.activeElement as HTMLElement | null;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    fecharRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", aoTeclar);
      origem?.focus?.();
    };
  }, [onClose, ir]);

  // Deslizar para o lado troca de foto no celular.
  const toque = useRef<number | null>(null);
  const foto = fotos[atual];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      className="fixed inset-0 z-50 flex flex-col bg-text/95"
      onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toque.current === null) return;
        const dx = e.changedTouches[0].clientX - toque.current;
        if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
        toque.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
        <p id={tituloId} className="text-small text-background">
          Foto {atual + 1} de {total} · {autor}
        </p>
        <Button ref={fecharRef} variant="secondary" iconOnly onClick={onClose} aria-label="Fechar">
          <Icon icon={X} />
        </Button>
      </div>
      <button type="button" aria-label="Fechar" tabIndex={-1} onClick={onClose} className="relative min-h-0 flex-1 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- fotos do Storage, já reduzidas no envio */}
        <img
          src={foto.url}
          alt={`Foto ${atual + 1} de ${total} da publicação de ${autor}`}
          width={foto.largura}
          height={foto.altura}
          className="mx-auto size-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </button>
      {total > 1 && (
        <div className="flex justify-center gap-4 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button variant="secondary" iconOnly onClick={() => ir(-1)} aria-label="Foto anterior">
            <Icon icon={ChevronLeft} />
          </Button>
          <Button variant="secondary" iconOnly onClick={() => ir(1)} aria-label="Próxima foto">
            <Icon icon={ChevronRight} />
          </Button>
        </div>
      )}
    </div>
  );
}
