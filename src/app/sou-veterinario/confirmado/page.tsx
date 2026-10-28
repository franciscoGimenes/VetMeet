import type { Metadata } from "next";
import Link from "next/link";
import { BOTAO_SECUNDARIO } from "@/components/estilos";
import { IconeVerificado } from "@/components/icones";

export const metadata: Metadata = {
  title: "Pré-cadastro recebido",
  robots: { index: false, follow: false },
};

export default function Confirmado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-marca-100 text-2xl text-marca-800">
        <IconeVerificado />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pré-cadastro recebido</h1>
      <p className="mt-3 text-base text-pretty text-slate-600">
        Obrigado! Vamos falar com você pelo WhatsApp ou e-mail informado quando seu perfil puder ir ao ar.
      </p>
      <Link href="/buscar" className={`${BOTAO_SECUNDARIO} mt-8`}>
        Ver como os perfis aparecem
      </Link>
    </div>
  );
}
