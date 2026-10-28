"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { enviarLink, type EstadoLogin } from "./actions";

export function FormLogin({ erroLink }: { erroLink: boolean }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(enviarLink, {});

  if (estado.enviado) {
    return (
      <p role="status" className="rounded-control bg-primary-soft px-4 py-3 text-small text-text ring-1 ring-primary/20 ring-inset">
        Se <strong className="font-semibold">{estado.email}</strong> tiver acesso, enviamos um link de entrada.
        Abra o e-mail neste mesmo navegador.
      </p>
    );
  }

  return (
    <form action={acao} className="space-y-4">
      {(estado.erro || erroLink) && (
        <p role="alert" className="rounded-control bg-error/10 px-4 py-3 text-small text-error-strong ring-1 ring-error/30 ring-inset">
          {estado.erro ?? "O link expirou ou já foi usado. Peça um novo."}
        </p>
      )}
      <Field id="email" label="E-mail">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={estado.email} />
      </Field>
      <Button type="submit" block disabled={enviando}>
        {enviando ? "Enviando..." : "Receber link de acesso"}
      </Button>
    </form>
  );
}
