import { cardClasses } from "@/components/ui";
import { cn } from "@/lib/cn";

// Esqueletos com a mesma forma das telas reais (cards com borda, avatar, linhas
// de texto e botões), para a página não "pular" quando os dados chegam.
const pulso = "animate-pulse bg-border/70";
const linha = (largura: string, altura = "h-4") => cn(pulso, altura, largura, "rounded-pill");

function Carregando({ rotulo, className, children }: { rotulo: string; className?: string; children: React.ReactNode }) {
  return (
    // min-h-dvh: o rodapé fica fora da tela enquanto carrega e não "pula" (CLS)
    // quando o conteúdo, mais alto que o esqueleto, chega.
    <div className={cn("min-h-dvh", className)} aria-busy="true" role="status">
      <span className="sr-only">{rotulo}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function EsqueletoCard() {
  return (
    <div className={cn(cardClasses({ padding: "md" }), "flex flex-col gap-4")}>
      <div className="flex gap-3">
        <div className={cn(pulso, "size-14 shrink-0 rounded-pill")} />
        <div className="flex-1 space-y-2 pt-2">
          <div className={linha("w-3/4", "h-5")} />
          <div className={linha("w-1/2")} />
          <div className={linha("w-1/3", "h-3")} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className={cn(pulso, "h-6 w-14 rounded-pill")} />
        <div className={cn(pulso, "h-6 w-16 rounded-pill")} />
      </div>
      <div className="space-y-2">
        <div className={linha("w-2/3")} />
        <div className={linha("w-1/2")} />
      </div>
      <div className="flex justify-between border-t border-border pt-3">
        <div className={linha("w-16")} />
        <div className={linha("w-24")} />
      </div>
      <div className="grid gap-2">
        <div className={cn(pulso, "h-11 rounded-control")} />
        <div className={cn(pulso, "h-11 rounded-control")} />
      </div>
    </div>
  );
}

export function EsqueletoBusca() {
  return (
    <Carregando rotulo="Carregando resultados" className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16 sm:px-6 lg:pt-8">
      <div className={cn(pulso, "h-11 rounded-control lg:h-20 lg:rounded-card")} />
      <div className="mt-6 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
        <div className={cn(pulso, "hidden h-96 rounded-card lg:block")} />
        <div>
          <div className={linha("mb-4 w-48", "h-6")} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <EsqueletoCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </Carregando>
  );
}

export function EsqueletoPerfil() {
  return (
    <Carregando rotulo="Carregando perfil" className="mx-auto w-full max-w-6xl px-4 pt-4 pb-6 sm:px-6 lg:pt-6">
      <div className={cn(pulso, "h-11 w-48 rounded-control")} />
      <div className={cn(cardClasses({ padding: "lg" }), "mt-4 flex gap-4 sm:items-center sm:gap-6")}>
        <div className={cn(pulso, "size-20 shrink-0 rounded-pill sm:size-24")} />
        <div className="flex-1 space-y-3">
          <div className={linha("w-2/3", "h-8")} />
          <div className={linha("w-1/3", "h-5")} />
          <div className={linha("w-1/2")} />
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:mt-8 md:gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6 md:space-y-8">
          {["w-full", "w-5/6", "w-2/3"].map((w) => (
            <div key={w} className={cardClasses({ padding: "lg" })}>
              <div className={linha("w-32", "h-6")} />
              <div className="mt-4 space-y-2">
                <div className={linha(w)} />
                <div className={linha("w-3/4")} />
              </div>
            </div>
          ))}
        </div>
        <div className={cn(cardClasses({ padding: "lg" }), "hidden space-y-4 lg:block")}>
          <div className={linha("w-24", "h-6")} />
          <div className={cn(pulso, "h-13 rounded-control")} />
          <div className={cn(pulso, "h-11 rounded-control")} />
        </div>
      </div>
    </Carregando>
  );
}

export function EsqueletoAdmin() {
  return (
    <Carregando rotulo="Carregando painel">
      <div className={linha("w-40", "h-9")} />
      <div className="mt-6 grid gap-4 sm:grid-cols-3 md:mt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(cardClasses({ padding: "lg" }), "space-y-2")}>
            <div className={linha("w-24")} />
            <div className={linha("w-16", "h-9")} />
            <div className={linha("w-28", "h-3")} />
          </div>
        ))}
      </div>
      <div className={cn(cardClasses({ padding: "lg" }), "mt-6 md:mt-8")}>
        <div className={linha("w-56", "h-6")} />
        <div className={cn(pulso, "mt-4 h-44 rounded-control")} />
      </div>
    </Carregando>
  );
}
