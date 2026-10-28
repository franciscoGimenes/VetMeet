import type { Metadata } from "next";
import { Suspense } from "react";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Entrar no painel" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Login({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:py-24">
      <h1 className="text-h1 text-text">Painel VetMeet</h1>
      <p className="mt-2 text-small text-text-muted">Enviaremos um link de entrada para o seu e-mail.</p>
      <div className="mt-6">
        <Suspense>
          <Formulario searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Formulario({ searchParams }: { searchParams: SearchParams }) {
  const { erro } = await searchParams;
  return <FormLogin erroLink={erro === "link"} />;
}
