import type { Metadata } from "next";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { ButtonLink, Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cadastro recebido",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Confirmado({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary-soft text-primary">
        <Icon icon={Check} size="lg" />
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
        <h1 className="mt-6 text-h1 text-text">Seu perfil está no ar</h1>
        <p className="mt-3 text-body text-pretty text-text-muted">
          Tutores já podem encontrar você na busca e chamar no WhatsApp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/vet/${slug}`}>Ver meu perfil</ButtonLink>
          <ButtonLink href="/buscar" variant="secondary">
            Ir para a busca
          </ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-h1 text-text">Cadastro recebido</h1>
      <p className="mt-3 text-body text-pretty text-text-muted">
        Obrigado! Vamos falar com você pelo WhatsApp ou e-mail informado.
      </p>
      <ButtonLink href="/buscar" variant="secondary" className="mt-8">
        Ver como os perfis aparecem
      </ButtonLink>
    </>
  );
}
