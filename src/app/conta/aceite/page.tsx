import { Suspense } from "react";
import { FormAceite } from "@/components/conta/Conta";
import { Card } from "@/components/ui";

export const metadata = { title: "Antes de continuar" };

// Quem entrou pelo LinkedIn (ou aceitou uma versão anterior dos termos) passa por aqui.
export default function Aceite() {
  return (
    <>
      <h1 className="text-h1 text-text">Antes de continuar</h1>
      <p className="mt-2 text-body text-text-muted">Para ter um perfil no VetMeet, confirme os itens abaixo.</p>
      <Card padding="lg" className="mt-6 md:mt-8">
        <Suspense>
          <FormAceite />
        </Suspense>
      </Card>
    </>
  );
}
