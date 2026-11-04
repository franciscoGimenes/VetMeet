"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { apagarComentario, comentar, type EstadoComentario } from "@/app/rede/actions";
import { Avatar } from "@/components/Avatar";
import { useRede } from "@/components/rede/RedeContexto";
import { Button, Card, CONTROLE, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COMENTARIO_MAX, dataPost, type Comentario } from "@/lib/rede";

export function Comentarios({
  postId,
  autorDoPost,
  comentarios,
}: {
  postId: string;
  // id do veterinário autor do post: ele apaga qualquer comentário no próprio post.
  autorDoPost: string;
  comentarios: Comentario[];
}) {
  const { visitante } = useRede();
  const meuVet = visitante.tipo === "veterinario" ? visitante.vetId : null;
  const tituloId = useId();

  return (
    <Card as="section" padding="lg" id="comentarios" aria-labelledby={tituloId} className="scroll-mt-4">
      <h2 id={tituloId} className="flex items-center gap-3 text-h3 text-text">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-primary">
          <Icon icon={MessageSquare} size="sm" />
        </span>
        Comentários ({comentarios.length})
      </h2>

      {comentarios.length === 0 ? (
        <p className="mt-4 text-small text-text-muted">Nenhum comentário ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {comentarios.map((c) => (
            <ItemComentario key={c.id} comentario={c} podeApagar={meuVet !== null && (meuVet === c.autor.id || meuVet === autorDoPost)} />
          ))}
        </ul>
      )}

      <FormComentario postId={postId} />
    </Card>
  );
}

function ItemComentario({ comentario: c, podeApagar }: { comentario: Comentario; podeApagar: boolean }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState(false);

  function apagar() {
    startTransition(async () => {
      const r = await apagarComentario(c.id);
      if ("erro" in r) setErro(true);
      else router.refresh();
    });
  }

  return (
    <li className={cn("flex gap-3 py-4 first:pt-0 last:pb-0", pendente && "opacity-60")}>
      <Link href={`/vet/${c.autor.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <Avatar nome={c.autor.nome} fotoUrl={c.autor.fotoUrl} tamanho="xs" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-small">
          <Link href={`/vet/${c.autor.slug}`} className="font-semibold text-text hover:underline hover:underline-offset-4">
            {c.autor.nome}
          </Link>{" "}
          <span className="text-text-muted">
            · <time dateTime={c.criadoEm}>{dataPost(c.criadoEm)}</time>
          </span>
        </p>
        <p className="mt-1 text-body whitespace-pre-line text-text">{c.texto}</p>
        {erro && <p className="mt-1 text-small text-error-strong">Não foi possível apagar agora.</p>}
      </div>
      {podeApagar && (
        <Button variant="ghost" iconOnly onClick={apagar} disabled={pendente} aria-label="Apagar comentário" className="-mt-2 shrink-0 text-text-muted">
          <Icon icon={Trash2} />
        </Button>
      )}
    </li>
  );
}

function FormComentario({ postId }: { postId: string }) {
  const { visitante, podeInteragir } = useRede();
  const router = useRouter();
  const [estado, acao, enviando] = useActionState<EstadoComentario, FormData>(comentar, {});
  const [texto, setTexto] = useState("");
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  // Comentário gravado: limpa o campo e busca a lista nova.
  useEffect(() => {
    if (!estado.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [estado.ok, router]);

  if (visitante.tipo !== "veterinario") {
    return (
      <div className="mt-6 border-t border-border pt-4">
        <Button variant="secondary" block onClick={() => podeInteragir()}>
          <Icon icon={MessageSquare} /> Comentar
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={acao}
      onReset={() => setTexto("")}
      className="mt-6 space-y-2 border-t border-border pt-4"
    >
      <input type="hidden" name="post_id" value={postId} />
      <label htmlFor={id} className="block text-small font-medium text-text">
        Seu comentário
      </label>
      <textarea
        id={id}
        name="texto"
        rows={3}
        maxLength={COMENTARIO_MAX}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-invalid={estado.erro ? true : undefined}
        aria-describedby={`${id}-info`}
        className={cn(CONTROLE, "py-2")}
      />
      <div id={`${id}-info`} className="flex items-center justify-between gap-2">
        {estado.erro ? (
          <p className="text-small text-error-strong">{estado.erro}</p>
        ) : (
          <p className="text-caption text-text-muted">
            {texto.length}/{COMENTARIO_MAX}
          </p>
        )}
        <Button type="submit" disabled={enviando || !texto.trim()}>
          {enviando ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </form>
  );
}
