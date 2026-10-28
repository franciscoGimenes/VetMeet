import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Contorno em border-strong (3:1 sobre surface), texto body (16px: o iOS não dá zoom).
export const CONTROLE =
  "min-h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-body text-text placeholder:text-text-muted focus-visible:border-primary aria-invalid:border-error";

// Rótulo + controle + erro/dica, com os ids ligados para leitores de tela.
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-small font-medium text-text">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-dica`} className="mt-1.5 text-small text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className="mt-1.5 text-small text-error-strong">
          {error}
        </p>
      )}
    </div>
  );
}

// Atributos de acessibilidade de um controle dentro de um Field.
export function fieldProps(id: string, { error, hint }: { error?: string; hint?: string }) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-erro` : hint ? `${id}-dica` : undefined,
  };
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROLE, className)} {...props} />;
}
