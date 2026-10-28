import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp";
export type ButtonSize = "md" | "lg";

const VARIANTES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-border-strong bg-surface text-text hover:bg-background",
  ghost: "text-primary hover:bg-primary-soft",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
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
    VARIANTES[variant],
    iconOnly ? (size === "lg" ? "size-13" : "size-11") : TAMANHOS[size],
    block && "w-full",
  );
}

export function Button({
  variant,
  size,
  block,
  iconOnly,
  className,
  type = "button",
  ...props
}: Estilo & ComponentProps<"button">) {
  return <button type={type} className={cn(buttonClasses({ variant, size, block, iconOnly }), className)} {...props} />;
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
