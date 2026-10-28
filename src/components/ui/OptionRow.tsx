import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Linha inteira clicável com checkbox (várias) ou radio (uma). O controle
// nativo fica escondido; o indicador desenhado tem 20px, mas o alvo de toque é
// a linha toda (mínimo 44px). Use em listas com espaçamento de 8px (space-y-2).
export function OptionRow({
  type = "checkbox",
  name,
  value,
  defaultChecked,
  hidden,
  hint,
  indent,
  children,
}: {
  type?: "checkbox" | "radio";
  name: string;
  value: string;
  defaultChecked?: boolean;
  hidden?: boolean;
  hint?: ReactNode;
  // Item subordinado (ex.: bairro dentro da cidade).
  indent?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex cursor-pointer", indent && "pl-6")} hidden={hidden}>
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 text-small text-text transition-colors hover:bg-background",
          "peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:font-medium peer-checked:text-primary",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
          "peer-checked:[&_.indicador]:border-primary peer-checked:[&_.indicador]:bg-primary",
          "[&_.indicador>svg]:opacity-0 peer-checked:[&_.indicador>svg]:opacity-100",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "indicador grid size-5 shrink-0 place-items-center border border-border-strong bg-surface text-white",
            type === "radio" ? "rounded-pill" : "rounded-mark",
          )}
        >
          <Icon icon={Check} size="sm" />
        </span>
        <span className="min-w-0 flex-1">
          {children}
          {hint && <span className="block text-caption font-normal text-text-muted">{hint}</span>}
        </span>
      </span>
    </label>
  );
}
