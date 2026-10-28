import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

// Seção recolhível (details/summary nativos: teclado e leitor de tela de graça).
// O cabeçalho inteiro é o alvo de toque (44px) e mostra um resumo do que está
// escolhido, para dar para ver o estado sem abrir.
export function Disclosure({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    // py-1: seções fechadas empilhadas ficam a 9px uma da outra (4 + linha + 4),
    // acima dos 8px mínimos entre alvos de toque.
    <details open={defaultOpen} className="group border-b border-border py-1 last:border-b-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-1 [&::-webkit-details-marker]:hidden">
        <span className="text-body font-semibold text-text">{title}</span>
        <span className="flex min-w-0 items-center gap-2 text-small text-text-muted">
          {summary && <span className="truncate">{summary}</span>}
          <Icon icon={ChevronDown} className="transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="pt-2 pb-5">{children}</div>
    </details>
  );
}
