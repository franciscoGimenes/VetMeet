"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

// Bottom sheet no celular. Com `estaticoNoDesktop`, a partir de lg o mesmo
// conteúdo vira um bloco comum na página (ex.: barra lateral de filtros), sem
// cabeçalho, rodapé nem fundo escurecido.
export function Sheet({
  open,
  onClose,
  title,
  footer,
  estaticoNoDesktop = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  estaticoNoDesktop?: boolean;
  children: ReactNode;
}) {
  const tituloId = useId();
  const fecharRef = useRef<HTMLButtonElement>(null);

  // Aberto: trava a rolagem do fundo, fecha com Esc, leva o foco para dentro e
  // devolve ao elemento de origem ao fechar.
  useEffect(() => {
    if (!open) return;
    const origem = document.activeElement as HTMLElement | null;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    fecharRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", aoTeclar);
      origem?.focus?.();
    };
  }, [open, onClose]);

  const desk = estaticoNoDesktop;

  return (
    <div
      className={cn(
        open ? "fixed inset-0 z-50 flex flex-col justify-end" : "hidden",
        desk && "lg:static lg:z-auto lg:block",
      )}
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className={cn("absolute inset-0 bg-text/50", desk && "lg:hidden")}
      />
      <section
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-labelledby={tituloId}
        className={cn(
          "relative flex max-h-[90dvh] flex-col rounded-t-card bg-surface shadow-overlay",
          desk && "lg:max-h-none lg:rounded-none lg:bg-transparent lg:shadow-none",
        )}
      >
        <div className={cn("flex items-center justify-between gap-2 border-b border-border py-2 pr-2 pl-4", desk && "lg:hidden")}>
          <h2 id={tituloId} className="text-h3 text-text">
            {title}
          </h2>
          <Button ref={fecharRef} variant="ghost" iconOnly onClick={onClose} aria-label="Fechar">
            <Icon icon={X} />
          </Button>
        </div>
        <div className={cn("flex-1 overflow-y-auto px-4 py-5", desk && "lg:overflow-visible lg:p-0")}>{children}</div>
        {footer && (
          <div
            className={cn(
              "flex gap-2 border-t border-border px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
              desk && "lg:hidden",
            )}
          >
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}
