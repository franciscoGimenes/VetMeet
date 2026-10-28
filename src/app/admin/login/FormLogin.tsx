"use client";

import { useActionState } from "react";
import { BOTAO_PRIMARIO } from "@/components/estilos";
import { enviarLink, type EstadoLogin } from "./actions";

export function FormLogin({ erroLink }: { erroLink: boolean }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(enviarLink, {});

  if (estado.enviado) {
    return (
      <p role="status" className="rounded-xl bg-marca-50 px-4 py-3 text-sm text-marca-900 ring-1 ring-marca-200 ring-inset">
        Se <strong>{estado.email}</strong> tiver acesso, enviamos um link de entrada. Abra o e-mail neste mesmo
        navegador.
      </p>
    );
  }

  return (
    <form action={acao} className="space-y-4">
      {(estado.erro || erroLink) && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 ring-inset">
          {estado.erro ?? "O link expirou ou já foi usado. Peça um novo."}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado.email}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-marca-600 focus:outline-2 focus:outline-marca-600/30 sm:text-sm"
        />
      </div>
      <button type="submit" disabled={enviando} className={`${BOTAO_PRIMARIO} w-full disabled:opacity-60`}>
        {enviando ? "Enviando..." : "Receber link de acesso"}
      </button>
    </form>
  );
}
