import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPreCadastro } from "@/components/FormPreCadastro";
import { getCatalogos } from "@/lib/catalogos";

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
      <h1 className="text-3xl font-bold tracking-tight text-balance text-slate-900">
        Mostre seu trabalho para tutores da sua região
      </h1>
      <p className="mt-3 text-base text-pretty text-slate-600">
        Faça o pré-cadastro e avisaremos quando seu perfil puder ir ao ar no VetMeet.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <Suspense>
          <Formulario />
        </Suspense>
      </div>
    </div>
  );
}

async function Formulario() {
  return <FormPreCadastro catalogos={await getCatalogos()} />;
}
