import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const BASE =
  "inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-4 text-small transition-colors";

// Aparência de chip para elementos que não são input (ex.: filtro ativo removível).
export function chipClasses({ selected = false }: { selected?: boolean } = {}) {
  return cn(
    BASE,
    selected
      ? "border-primary bg-primary-soft font-medium text-primary hover:bg-primary-soft"
      : "border-border-strong bg-surface text-text hover:border-text-muted",
  );
}

// Chip selecionável de formulário: radio (uma opção) ou checkbox (várias).
// Selecionado = fundo, borda, texto e ícone de check (não depende só da cor).
export function Chip({
  type = "checkbox",
  name,
  value,
  defaultChecked,
  dataCampo,
  children,
}: {
  type?: "checkbox" | "radio";
  name: string;
  value: string;
  defaultChecked?: boolean;
  dataCampo?: string;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        data-campo={dataCampo}
        className="peer sr-only"
      />
      <span
        className={cn(
          BASE,
          "border-border-strong bg-surface text-text hover:border-text-muted",
          "peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:font-medium peer-checked:text-primary",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
          "[&>svg]:hidden peer-checked:[&>svg]:block",
        )}
      >
        <Icon icon={Check} size="sm" />
        {children}
      </span>
    </label>
  );
}
