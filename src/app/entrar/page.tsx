import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Alerta, BotaoLinkedIn, FormEntrar, Separador } from "@/components/conta/FormsAuth";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Área do veterinário no VetMeet.",
  alternates: { canonical: "/entrar" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const AVISOS: Record<string, { tom: "erro" | "ok"; texto: string }> = {
  link: { tom: "erro", texto: "O link expirou ou já foi usado. Entre com sua senha ou peça um novo link." },
  linkedin: { tom: "erro", texto: "Não foi possível entrar com o LinkedIn agora. Tente de novo ou use e-mail e senha." },
  excluida: { tom: "ok", texto: "Sua conta e seus dados foram excluídos." },
  senha: { tom: "ok", texto: "Senha alterada. Entre com a nova senha." },
};

export default function Entrar({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <h1 className="text-h1 text-text">Área do veterinário</h1>
      <p className="mt-2 text-body text-text-muted">Entre para editar seu perfil no VetMeet.</p>
      <Card padding="lg" className="mt-6 md:mt-8">
        <Suspense fallback={<FormEntrar />}>
          <ComAviso searchParams={searchParams} />
        </Suspense>
        <Separador />
        <BotaoLinkedIn />
      </Card>
      <p className="mt-6 text-center text-body text-text">
        Ainda não tem conta?{" "}
        <Link href="/sou-veterinario" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

async function ComAviso({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const chave = ["erro", "conta"].map((k) => sp[k]).find((v): v is string => typeof v === "string");
  const aviso = chave ? AVISOS[chave] : undefined;
  return <FormEntrar aviso={aviso && <Alerta tom={aviso.tom}>{aviso.texto}</Alerta>} />;
}
