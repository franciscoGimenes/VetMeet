import type { Metadata } from "next";
import Link from "next/link";
import { FormRecuperar } from "@/components/conta/FormsAuth";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function Recuperar() {
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <h1 className="text-h1 text-text">Recuperar senha</h1>
      <p className="mt-2 text-body text-text-muted">Enviaremos um link para você criar uma nova senha.</p>
      <Card padding="lg" className="mt-6 md:mt-8">
        <FormRecuperar />
      </Card>
      <p className="mt-6 text-center">
        <Link href="/entrar" className="inline-flex min-h-11 items-center text-body font-medium text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
