import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/cn";

// md: compacto (cards de lista, sempre 16px) · lg: padrão do design system (16px / 24px).
const PADDING = {
  none: "",
  md: "p-4",
  lg: "p-4 sm:p-6",
} as const;

export function cardClasses({ padding = "lg" }: { padding?: keyof typeof PADDING } = {}) {
  return cn("rounded-card border border-border bg-surface shadow-card", PADDING[padding]);
}

export function Card<T extends ElementType = "div">({
  as,
  padding,
  className,
  ...props
}: { as?: T; padding?: keyof typeof PADDING } & ComponentProps<T>) {
  const Elemento = (as ?? "div") as ElementType;
  return <Elemento className={cn(cardClasses({ padding }), className)} {...props} />;
}
