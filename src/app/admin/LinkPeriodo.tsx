"use client";

import { LoaderCircle } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

// Troca de período: o giro aparece no próprio link enquanto os números chegam.
export function LinkPeriodo({ href, atual, children }: { href: string; atual: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={atual ? "page" : undefined}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-small font-medium text-text hover:bg-background aria-[current=page]:bg-primary aria-[current=page]:text-white"
    >
      {children}
      <Indicador />
    </Link>
  );
}

function Indicador() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <>
      <Icon icon={LoaderCircle} size="sm" className="motion-safe:animate-spin" />
      <span className="sr-only">Carregando</span>
    </>
  );
}
