import type { Metadata } from "next";
import Link from "next/link";
import { BotaoLinkedIn, FormCadastro, Separador } from "@/components/conta/FormsAuth";
import { Card } from "@/components/ui";

const DESCRICAO = "Crie sua conta, monte seu perfil e apareça para tutores do Alto Tietê e da Zona Leste de São Paulo.";

export const metadata: Metadata = {
  title: "Sou veterinário",
  description: DESCRICAO,
  alternates: { canonical: "/sou-veterinario" },
  openGraph: { title: "Sou veterinário | VetMeet", description: DESCRICAO, url: "/sou-veterinario" },
};

const PASSOS = ["Crie sua conta", "Preencha seu perfil", "Publique e apareça na busca"];

export default function SouVeterinario() {
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <h1 className="text-h1 text-balance text-text">Mostre seu trabalho para tutores da sua região</h1>
      <ol className="mt-4 space-y-2">
        {PASSOS.map((p, i) => (
          <li key={p} className="flex items-center gap-3 text-body text-text">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-small font-semibold text-primary">
              {i + 1}
            </span>
            {p}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-small text-pretty text-text-muted">
        É gratuito. Seu e-mail não aparece no site; tutores falam com você pelo WhatsApp.
      </p>

      <Card padding="lg" className="mt-6 md:mt-8">
        <FormCadastro />
        <Separador />
        <BotaoLinkedIn>Criar conta com LinkedIn</BotaoLinkedIn>
      </Card>

      <p className="mt-6 text-center text-body text-text">
        Já tem conta?{" "}
        <Link href="/entrar" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
