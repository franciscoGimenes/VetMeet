"use client";

import { Stethoscope } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ButtonLink, Icon, Sheet } from "@/components/ui";
import type { Visitante } from "@/lib/rede";

type Contexto = {
  visitante: Visitante;
  // Tenta interagir: devolve true se pode; senão abre o aviso e devolve false.
  podeInteragir: () => boolean;
};

const RedeCtx = createContext<Contexto>({ visitante: { tipo: "visitante" }, podeInteragir: () => false });

export const useRede = () => useContext(RedeCtx);

// Um aviso só para a tela inteira (feed, post, perfil), em vez de um por card.
export function RedeProvider({ visitante, children }: { visitante: Visitante; children: ReactNode }) {
  const [aviso, setAviso] = useState(false);
  const podeInteragir = useCallback(() => {
    if (visitante.tipo === "veterinario") return true;
    setAviso(true);
    return false;
  }, [visitante]);
  const fechar = useCallback(() => setAviso(false), []);
  const valor = useMemo(() => ({ visitante, podeInteragir }), [visitante, podeInteragir]);

  const semPerfil = visitante.tipo === "sem-perfil";
  return (
    <RedeCtx.Provider value={valor}>
      {children}
      <Sheet open={aviso} onClose={fechar} title="Exclusivo para veterinários">
        <div className="mx-auto max-w-md space-y-4 pb-2 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary">
            <Icon icon={Stethoscope} size="lg" />
          </span>
          <p className="text-body text-text">
            {semPerfil
              ? "Para curtir e comentar, seu perfil precisa estar publicado e ativo."
              : "Curtir e comentar na Rede é exclusivo para veterinários com perfil no VetMeet. Você pode ler tudo à vontade."}
          </p>
          {semPerfil ? (
            <ButtonLink href="/conta" size="lg" block>
              Ir para Meu perfil
            </ButtonLink>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink href="/entrar" variant="secondary" size="lg" className="flex-1">
                Entrar
              </ButtonLink>
              <ButtonLink href="/sou-veterinario" size="lg" className="flex-1">
                Sou veterinário
              </ButtonLink>
            </div>
          )}
        </div>
      </Sheet>
    </RedeCtx.Provider>
  );
}
