import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "whatsapp" | "danger" | "dangerGhost";
export type ButtonSize = "md" | "lg";

const VARIANTES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  // CTA de destaque: no máximo um por área visível. Texto escuro (branco sobre accent reprova).
  accent: "bg-accent text-text hover:bg-caramel-200",
  secondary: "border border-border-strong bg-surface text-text hover:bg-background",
  ghost: "text-primary hover:bg-primary-soft",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
  // Ação destrutiva (excluir conta): contorno e texto em error-strong, nunca fundo vermelho.
  danger: "border border-error-strong bg-surface text-error-strong hover:bg-error/10",
  // Entrada discreta de uma ação destrutiva (abre a confirmação), em listas e menus.
  dangerGhost: "text-error-strong hover:bg-error/10",
};

// md: 44px de altura (alvo mínimo de toque) · lg: 52px.
const TAMANHOS: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-body",
  lg: "min-h-13 px-6 text-body",
};

type Estilo = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; iconOnly?: boolean };

// Exposto para elementos que precisam ser outra coisa (ex.: <a> com registro de clique).
export function buttonClasses({ variant = "primary", size = "md", block, iconOnly }: Estilo = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap transition-colors select-none",
    "disabled:pointer-events-none disabled:opacity-60",
    // Carregando: mantém a cor cheia (o giro já diz que está ocupado).
    "aria-busy:cursor-progress aria-busy:opacity-100",
    VARIANTES[variant],
    iconOnly ? (size === "lg" ? "size-13" : "size-11") : TAMANHOS[size],
    block && "w-full",
  );
}

// carregando: ação em andamento. Trava o botão e mostra o giro antes do texto.
// Em formulários, prefira BotaoEnviar, que liga isso sozinho.
export function Button({
  variant,
  size,
  block,
  iconOnly,
  className,
  type = "button",
  carregando,
  disabled,
  children,
  ...props
}: Estilo & ComponentProps<"button"> & { carregando?: boolean }) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, block, iconOnly }), className)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando && <Icon icon={LoaderCircle} className="motion-safe:animate-spin" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  iconOnly,
  className,
  ...props
}: Estilo & ComponentProps<typeof Link>) {
  return <Link className={cn(buttonClasses({ variant, size, block, iconOnly }), className)} {...props} />;
}
