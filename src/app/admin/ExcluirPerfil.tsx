"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Alerta, BotaoEnviar, Button, Icon } from "@/components/ui";
import { excluirPerfilAdmin, type EstadoPerfilAdmin } from "./actions";

// Excluir de vez pede uma segunda confirmação, com o que vai ser apagado.
// O foco vai para a confirmação ao abrir e volta para "Excluir" ao cancelar;
// Esc também cancela (menos durante a exclusão).
export function ExcluirPerfil({
  nome,
  vetId,
  userId,
}: {
  nome: string;
  vetId?: string;
  userId?: string | null;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [estado, acao, excluindo] = useActionState<EstadoPerfilAdmin, FormData>(excluirPerfilAdmin, {});
  const caixa = useRef<HTMLFormElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const abriu = useRef(false);

  useEffect(() => {
    if (confirmar) caixa.current?.focus();
    else if (abriu.current) botao.current?.focus();
    abriu.current = confirmar;
  }, [confirmar]);

  if (!confirmar) {
    return (
      <Button ref={botao} variant="dangerGhost" onClick={() => setConfirmar(true)}>
        <Icon icon={Trash2} />
        Excluir
      </Button>
    );
  }

  return (
    <form
      ref={caixa}
      action={acao}
      tabIndex={-1}
      aria-label={`Confirmar exclusão de ${nome}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !excluindo) setConfirmar(false);
      }}
      className="w-full space-y-3 rounded-card bg-error/10 p-4 outline-none sm:max-w-sm"
    >
      {vetId && <input type="hidden" name="vet_id" value={vetId} />}
      {userId && <input type="hidden" name="user_id" value={userId} />}
      <p className="text-small text-text">
        Excluir <strong className="font-semibold break-all">{nome}</strong>?{" "}
        {userId
          ? "Apaga a conta, o perfil, as publicações, os comentários e as fotos. A pessoa poderá se cadastrar de novo."
          : "Apaga o perfil, as publicações e os comentários."}{" "}
        Não dá para desfazer.
      </p>
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <div className="flex flex-wrap gap-2">
        <BotaoEnviar variant="danger" textoCarregando="Excluindo...">
          Excluir de vez
        </BotaoEnviar>
        <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={excluindo}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
