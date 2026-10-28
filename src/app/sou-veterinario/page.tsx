import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPreCadastro } from "@/components/FormPreCadastro";
import { Card } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import { PUBLICAR_PRE_CADASTRO_DIRETO } from "@/lib/mvp";

export const metadata: Metadata = {
  title: "Sou veterinário",
  description: "Faça o pré-cadastro e apareça para tutores do Alto Tietê e da Zona Leste de São Paulo.",
  alternates: { canonical: "/sou-veterinario" },
  openGraph: {
    title: "Sou veterinário | VetMeet",
    description: "Faça o pré-cadastro e apareça para tutores do Alto Tietê e da Zona Leste de São Paulo.",
    url: "/sou-veterinario",
  },
};

export default function SouVeterinario() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <h1 className="text-h1 text-balance text-text">
        Mostre seu trabalho para tutores da sua região
      </h1>
      <p className="mt-3 text-body text-pretty text-text-muted">
        {PUBLICAR_PRE_CADASTRO_DIRETO
          ? "Cadastre-se e seu perfil aparece na busca do VetMeet na hora. Seu e-mail não fica visível no site."
          : "Faça o pré-cadastro e avisaremos quando seu perfil puder ir ao ar no VetMeet."}
      </p>
      <Card padding="lg" className="mt-8">
        <Suspense>
          <Formulario />
        </Suspense>
      </Card>
    </div>
  );
}

async function Formulario() {
  return <FormPreCadastro catalogos={await getCatalogos()} />;
}
