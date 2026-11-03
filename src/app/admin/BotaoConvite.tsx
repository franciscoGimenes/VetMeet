"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { enviarConvite, type EstadoConvite } from "./actions";

export function BotaoConvite({ id, convidadoEm }: { id: number; convidadoEm: string | null }) {
  const [estado, acao, enviando] = useActionState<EstadoConvite, FormData>(enviarConvite, {});
  const data = convidadoEm
    ? new Date(convidadoEm).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : null;
  return (
    <form action={acao} className="flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" disabled={enviando}>
        {enviando ? "Enviando..." : data ? "Reenviar convite" : "Enviar convite"}
      </Button>
      {estado.erro ? (
        <span role="alert" className="text-caption text-error-strong">
          {estado.erro}
        </span>
      ) : (
        data && <span className="text-caption text-text-muted">{estado.ok ? "Enviado agora" : `Convidado em ${data}`}</span>
      )}
    </form>
  );
}
