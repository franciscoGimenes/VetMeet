"use client";

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink, Icon } from "@/components/ui";

// Falha inesperada em qualquer página (ex.: banco fora do ar). O cabeçalho e o
// rodapé do layout continuam na tela; só o conteúdo vira esta mensagem.
export default function Erro({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-h1 text-text">Não foi possível carregar esta página</h1>
      <p className="mt-2 text-body text-text-muted">Pode ser uma instabilidade momentânea. Tente de novo em instantes.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>
          <Icon icon={RotateCw} />
          Tentar de novo
        </Button>
        <ButtonLink href="/" variant="secondary">
          Ir para o início
        </ButtonLink>
      </div>
    </div>
  );
}
