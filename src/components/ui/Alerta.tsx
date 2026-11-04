import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Aviso em bloco (topo de formulário, retorno de ação). Status sempre com ícone + texto.
// tabIndex -1: useMostrarErro leva o foco até ele quando não há campo marcado.
export function Alerta({ tom = "erro", children }: { tom?: "erro" | "ok"; children: ReactNode }) {
  const erro = tom === "erro";
  return (
    <div
      role={erro ? "alert" : "status"}
      tabIndex={-1}
      className={cn(
        "flex gap-2 rounded-control px-4 py-3 text-small text-text ring-1 ring-inset",
        erro ? "bg-error/10 ring-error/30" : "bg-primary-soft ring-primary/20",
      )}
    >
      <Icon icon={erro ? CircleAlert : CircleCheck} className={cn("mt-px", erro ? "text-error-strong" : "text-primary")} />
      <div className={cn("min-w-0", erro && "text-error-strong")}>{children}</div>
    </div>
  );
}

// Mensagem de erro de um campo ou grupo. `data-erro` marca o alvo de useMostrarErro.
export function ErroCampo({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <p id={id} data-erro tabIndex={-1} className={cn("mt-1.5 flex gap-1.5 text-small text-error-strong", className)}>
      <Icon icon={CircleAlert} size="sm" className="mt-0.5" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
