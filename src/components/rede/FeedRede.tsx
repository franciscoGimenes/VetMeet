"use client";

import { useState, useTransition } from "react";
import { carregarMais } from "@/app/rede/actions";
import { CardPost } from "@/components/rede/CardPost";
import { Button, ErroCampo } from "@/components/ui";
import type { FiltrosRede, PostResumo } from "@/lib/rede";

// Lista cronológica com "Carregar mais" (cursor). A página do servidor monta
// a primeira leva; as seguintes chegam pela Server Action. Quem usa passa
// `key` com a query string: filtro novo = lista nova.
export function FeedRede({
  posts: iniciais,
  proximo: proximoInicial,
  curtidos: curtidosIniciais,
  filtros,
  autor,
  vazio,
}: {
  posts: PostResumo[];
  proximo: string | null;
  curtidos: string[];
  filtros: FiltrosRede;
  autor?: string;
  vazio: React.ReactNode;
}) {
  const [extras, setExtras] = useState<PostResumo[]>([]);
  const [curtidosExtras, setCurtidosExtras] = useState<string[]>([]);
  const [proximo, setProximo] = useState(proximoInicial);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [erro, setErro] = useState(false);
  const [pendente, startTransition] = useTransition();

  // A primeira leva vem sempre do servidor (atualiza com router.refresh);
  // as seguintes ficam aqui, sem repetir post.
  const vistos = new Set(iniciais.map((p) => p.id));
  const posts = [...iniciais, ...extras.filter((p) => !vistos.has(p.id))].filter((p) => !removidos.includes(p.id));
  const curtidos = new Set([...curtidosIniciais, ...curtidosExtras]);

  function mais() {
    if (!proximo) return;
    setErro(false);
    startTransition(async () => {
      try {
        const r = await carregarMais(filtros, proximo, autor);
        setExtras((e) => [...e, ...r.posts]);
        setCurtidosExtras((c) => [...c, ...r.curtidos]);
        setProximo(r.proximo);
      } catch {
        setErro(true);
      }
    });
  }

  if (!posts.length) return <>{vazio}</>;

  return (
    <div className="space-y-4 md:space-y-6">
      {posts.map((p) => (
        <CardPost
          key={p.id}
          post={p}
          curtido={curtidos.has(p.id)}
          aoExcluir={() => setRemovidos((r) => [...r, p.id])}
        />
      ))}
      {proximo && (
        <div className="flex flex-col items-center gap-2">
          <Button variant="secondary" size="lg" onClick={mais} disabled={pendente} aria-live="polite">
            {pendente ? "Carregando..." : "Carregar mais"}
          </Button>
          {erro && (
            <ErroCampo className="mt-0">Não foi possível carregar agora. Tente de novo.</ErroCampo>
          )}
        </div>
      )}
    </div>
  );
}
