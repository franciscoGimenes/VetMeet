"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Alerta, Button, Icon } from "@/components/ui";
import { excluirPerfilAdmin, type EstadoPerfilAdmin } from "./actions";

// Excluir de vez pede uma segunda confirmação, com o que vai ser apagado.
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

  if (!confirmar) {
    return (
      <Button variant="dangerGhost" onClick={() => setConfirmar(true)}>
        <Icon icon={Trash2} />
        Excluir
      </Button>
    );
  }

  return (
    <form action={acao} className="w-full space-y-3 rounded-card bg-error/10 p-4 sm:max-w-sm">
      {vetId && <input type="hidden" name="vet_id" value={vetId} />}
      {userId && <input type="hidden" name="user_id" value={userId} />}
      <p className="text-small text-text">
        Excluir <strong className="font-semibold">{nome}</strong>?{" "}
        {userId
          ? "Apaga a conta, o perfil, as publicações, os comentários e as fotos. A pessoa poderá se cadastrar de novo."
          : "Apaga o perfil, as publicações e os comentários."}{" "}
        Não dá para desfazer.
      </p>
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" disabled={excluindo}>
          {excluindo ? "Excluindo..." : "Excluir de vez"}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={excluindo}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
