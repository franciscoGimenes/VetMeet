import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TAMANHOS = { sm: 16, md: 20, lg: 24 } as const;

// Único jeito de desenhar ícone no projeto: lucide-react, traço 2, três tamanhos.
// sm: dentro de texto small/caption · md: padrão · lg: destaques.
export function Icon({
  icon: Componente,
  size = "md",
  label,
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof TAMANHOS;
  // Só quando o ícone sozinho carrega significado; senão fica oculto do leitor de tela.
  label?: string;
  className?: string;
}) {
  return (
    <Componente
      size={TAMANHOS[size]}
      strokeWidth={2}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0", className)}
    />
  );
}
