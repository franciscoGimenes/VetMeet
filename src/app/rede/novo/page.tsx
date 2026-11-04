import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Alerta } from "@/components/conta/FormsAuth";
import { EsqueletoConta } from "@/components/Esqueletos";
import { FormPost } from "@/components/rede/FormPost";
import { ButtonLink, Icon } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import { etapaDaConta, exigirSessao } from "@/lib/conta";

export const metadata: Metadata = { title: "Nova publicação", robots: { index: false, follow: false } };

export default function NovaPublicacao() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16 sm:px-6 lg:pt-6">
      <Suspense fallback={<EsqueletoConta />}>
        <Conteudo />
      </Suspense>
    </div>
  );
}

async function Conteudo() {
  const sessao = await exigirSessao();
  // Sem aceite ou sem perfil: completa a conta antes de publicar.
  const etapa = await etapaDaConta(sessao);
  if (typeof etapa === "string") redirect(etapa);
  const catalogos = await getCatalogos();

  return (
    <>
      <ButtonLink href="/rede" variant="ghost" className="-ml-4">
        <Icon icon={ArrowLeft} />
        Rede
      </ButtonLink>
      <h1 className="mt-2 text-h1 text-text">Nova publicação</h1>
      <p className="mt-2 text-body text-text-muted">
        Compartilhe dicas, casos e o dia a dia do seu trabalho. Não exponha dados de tutores.
      </p>
      {etapa.perfil.status !== "ativo" && (
        <div className="mt-4">
          <Alerta>Seu perfil está pausado: suas publicações só aparecem quando ele voltar à busca.</Alerta>
        </div>
      )}
      <div className="mt-6 md:mt-8">
        <FormPost catalogos={catalogos} userId={sessao.user.id} />
      </div>
    </>
  );
}
