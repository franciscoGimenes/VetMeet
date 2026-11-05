"use client";

import { useActionState } from "react";
import { BotaoEnviar, ErroCampo } from "@/components/ui";
import { enviarConvite, type EstadoConvite } from "./actions";

export function BotaoConvite({ id, convidadoEm }: { id: number; convidadoEm: string | null }) {
  const [estado, acao] = useActionState<EstadoConvite, FormData>(enviarConvite, {});
  const data = convidadoEm
    ? new Date(convidadoEm).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : null;
  return (
    <form action={acao} className="flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <BotaoEnviar variant="secondary" textoCarregando="Enviando...">
        {data ? "Reenviar convite" : "Enviar convite"}
      </BotaoEnviar>
      {estado.erro ? (
        <div role="alert">
          <ErroCampo className="max-w-xs">{estado.erro}</ErroCampo>
        </div>
      ) : (
        data && <span className="text-caption text-text-muted">{estado.ok ? "Enviado agora" : `Convidado em ${data}`}</span>
      )}
    </form>
  );
}
