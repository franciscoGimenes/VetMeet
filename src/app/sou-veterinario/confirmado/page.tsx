import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "@/components/estilos";
import { IconeVerificado } from "@/components/icones";

export const metadata: Metadata = {
  title: "Cadastro recebido",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Confirmado({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-marca-100 text-2xl text-marca-800">
        <IconeVerificado />
      </div>
      <Suspense>
        <Mensagem searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Mensagem({ searchParams }: { searchParams: SearchParams }) {
  const { perfil } = await searchParams;
  const slug = typeof perfil === "string" && /^[a-z0-9-]+$/.test(perfil) ? perfil : null;

  if (slug) {
    return (
      <>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Seu perfil está no ar</h1>
        <p className="mt-3 text-base text-pretty text-slate-600">
          Tutores já podem encontrar você na busca e chamar no WhatsApp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/vet/${slug}`} className={BOTAO_PRIMARIO}>
            Ver meu perfil
          </Link>
          <Link href="/buscar" className={BOTAO_SECUNDARIO}>
            Ir para a busca
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Cadastro recebido</h1>
      <p className="mt-3 text-base text-pretty text-slate-600">
        Obrigado! Vamos falar com você pelo WhatsApp ou e-mail informado.
      </p>
      <Link href="/buscar" className={`${BOTAO_SECUNDARIO} mt-8`}>
        Ver como os perfis aparecem
      </Link>
    </>
  );
}
