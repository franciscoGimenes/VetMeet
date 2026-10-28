import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Rótulo estático (não clicável). Texto sempre em tom com contraste AA.
const VARIANTES = {
  neutral: "border border-border bg-background text-text",
  primary: "bg-primary-soft text-primary",
  demo: "bg-accent-soft text-accent-strong",
  success: "bg-success/10 text-success-strong",
  warning: "bg-warning/15 text-warning-strong",
  error: "bg-error/10 text-error-strong",
  info: "bg-info/10 text-info-strong",
} as const;

export type BadgeVariant = keyof typeof VARIANTES;

export function badgeClasses(variant: BadgeVariant = "neutral") {
  return cn(
    "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-medium whitespace-nowrap",
    VARIANTES[variant],
  );
}

export function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: ReactNode }) {
  return <span className={badgeClasses(variant)}>{children}</span>;
}
