import type { ReactNode } from "react";

export type SecaoLegal = { titulo: string; paragrafos: ReactNode[] };

// Página de texto longo (termos, privacidade): coluna estreita, títulos numerados
// porque o texto é citado por item ("cláusula 4").
export function TextoLegal({
  titulo,
  versao,
  intro,
  secoes,
}: {
  titulo: string;
  versao: string;
  intro: ReactNode;
  secoes: SecaoLegal[];
}) {
  const data = new Date(`${versao}T12:00:00`).toLocaleDateString("pt-BR", { dateStyle: "long" });
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <h1 className="text-h1 text-balance text-text">{titulo}</h1>
      <p className="mt-2 text-small text-text-muted">Versão de {data}</p>
      <div className="mt-6 text-body text-pretty text-text md:mt-8">{intro}</div>
      <ol className="mt-6 space-y-8 md:mt-8">
        {secoes.map((s, i) => (
          <li key={s.titulo}>
            <h2 className="text-h3 text-text">
              {i + 1}. {s.titulo}
            </h2>
            <div className="mt-2 space-y-3 text-body text-pretty text-text">
              {s.paragrafos.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
