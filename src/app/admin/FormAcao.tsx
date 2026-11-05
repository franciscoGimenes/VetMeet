"use client";

import { useActionState, useId, type ReactNode } from "react";
import { ErroCampo } from "@/components/ui";
import type { EstadoAcao } from "./actions";

// Formulário de uma ação do painel (tirar do ar, marcar denúncia...). Os botões
// dentro dele são BotaoEnviar, que giram enquanto o servidor responde; se a
// ação falhar, o motivo aparece logo abaixo.
export function FormAcao({
  acao,
  campos,
  className,
  children,
}: {
  acao: (anterior: EstadoAcao, form: FormData) => Promise<EstadoAcao>;
  campos: Record<string, string | number>;
  className?: string;
  children: ReactNode;
}) {
  const [estado, executar] = useActionState(acao, {});
  const id = useId();
  return (
    <div className={className}>
      <form action={executar} aria-describedby={estado.erro ? id : undefined} className="flex flex-wrap gap-2">
        {Object.entries(campos).map(([nome, valor]) => (
          <input key={nome} type="hidden" name={nome} value={valor} />
        ))}
        {children}
      </form>
      <div role="alert">
        {estado.erro && (
          <ErroCampo id={id} className="max-w-xs">
            {estado.erro}
          </ErroCampo>
        )}
      </div>
    </div>
  );
}
