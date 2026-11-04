"use client";

import { Heart, MessageSquare, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { alternarFixado, curtir, excluirPost } from "@/app/rede/actions";
import { Avatar } from "@/components/Avatar";
import { useRede } from "@/components/rede/RedeContexto";
import { Galeria } from "@/components/rede/Galeria";
import { SeloDemo } from "@/components/SeloDemo";
import { Badge, Button, ButtonLink, Card, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dataPost, nomeCategoria, type PostResumo } from "@/lib/rede";

export function CardPost({
  post,
  curtido,
  completo = false,
  aoExcluir,
}: {
  post: PostResumo;
  curtido: boolean;
  // Página do post: texto inteiro, sem link para ela mesma.
  completo?: boolean;
  aoExcluir?: () => void;
}) {
  const { visitante } = useRede();
  const meu = visitante.tipo === "veterinario" && visitante.vetId === post.autor.id;
  const tituloId = useId();
  const linkPost = `/rede/post/${post.id}`;

  return (
    <Card as="article" padding="lg" aria-labelledby={tituloId} className="space-y-4">
      <header className="flex items-start gap-3">
        <Link href={`/vet/${post.autor.slug}`} className="shrink-0 rounded-pill" tabIndex={-1} aria-hidden="true">
          <Avatar nome={post.autor.nome} fotoUrl={post.autor.fotoUrl} tamanho="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 id={tituloId} className="text-body font-semibold text-text">
            <Link href={`/vet/${post.autor.slug}`} className="hover:underline hover:underline-offset-4">
              {post.autor.nome}
            </Link>
          </h2>
          <p className="text-caption text-text-muted">{post.autor.crmv}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-text-muted">
            <Badge variant="primary">{nomeCategoria(post.categoria)}</Badge>
            <time dateTime={post.criadoEm}>{dataPost(post.criadoEm)}</time>
            {post.editadoEm && <span>(editado)</span>}
            {post.fixado && (
              <span className="inline-flex items-center gap-1">
                <Icon icon={Pin} size="sm" /> Fixado
              </span>
            )}
          </p>
          {post.isDemo && (
            <div className="mt-2">
              <SeloDemo />
            </div>
          )}
        </div>
        {meu && <MenuAutor post={post} completo={completo} aoExcluir={aoExcluir} />}
      </header>

      <Texto texto={post.texto} completo={completo} />

      <Galeria fotos={post.fotos} autor={post.autor.nome} />

      {(post.especies.length > 0 || post.servicos.length > 0) && (
        <ul className="flex flex-wrap gap-2" aria-label="Marcações">
          {post.especies.map((e) => (
            <li key={e.slug}>
              <Link href={`/rede?especie=${e.slug}`} className="inline-flex min-h-11 items-center rounded-pill border border-border px-3 text-caption font-medium text-text hover:bg-background">
                {e.nome}
              </Link>
            </li>
          ))}
          {post.servicos.map((s) => (
            <li key={s.slug}>
              <Link href={`/rede?servico=${s.slug}`} className="inline-flex min-h-11 items-center rounded-pill border border-border px-3 text-caption font-medium text-text hover:bg-background">
                {s.nome}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="-mx-2 -mb-2 flex items-center gap-2 border-t border-border pt-2">
        <Curtir postId={post.id} curtidas={post.curtidas} curtido={curtido} meu={meu} />
        {completo ? (
          <a href="#comentarios" className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-small text-text-muted hover:bg-background">
            <Icon icon={MessageSquare} />
            <span>
              {post.comentarios} <span className="sr-only">{post.comentarios === 1 ? "comentário" : "comentários"}</span>
            </span>
          </a>
        ) : (
          <Link
            href={`${linkPost}#comentarios`}
            className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-small text-text-muted hover:bg-background"
          >
            <Icon icon={MessageSquare} />
            <span>
              {post.comentarios}{" "}
              <span className="sr-only">{post.comentarios === 1 ? "comentário: ver e comentar" : "comentários: ver e comentar"}</span>
            </span>
          </Link>
        )}
        {!completo && (
          <Link href={linkPost} className="ml-auto inline-flex min-h-11 items-center rounded-control px-3 text-small font-medium text-primary hover:bg-primary-soft">
            Abrir publicação
          </Link>
        )}
      </footer>
    </Card>
  );
}

// Texto com "ver mais" quando passa de 6 linhas (medido depois de montar).
function Texto({ texto, completo }: { texto: string; completo: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [aberto, setAberto] = useState(completo);
  const [corta, setCorta] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !completo) setCorta(el.scrollHeight > el.clientHeight + 1);
  }, [texto, completo]);

  return (
    <div>
      <p ref={ref} className={cn("text-body whitespace-pre-line text-text", !aberto && "line-clamp-6")}>
        {texto}
      </p>
      {corta && !aberto && (
        <Button variant="ghost" className="-ml-4" onClick={() => setAberto(true)}>
          Ver mais
        </Button>
      )}
    </div>
  );
}

function Curtir({ postId, curtidas, curtido, meu }: { postId: string; curtidas: number; curtido: boolean; meu: boolean }) {
  const { podeInteragir } = useRede();
  const [estado, setEstado] = useState({ curtido, curtidas });
  const [, startTransition] = useTransition();
  // Dados novos do servidor (ex.: depois de router.refresh) substituem o local.
  const [base, setBase] = useState({ curtido, curtidas });
  if (base.curtido !== curtido || base.curtidas !== curtidas) {
    setBase({ curtido, curtidas });
    setEstado({ curtido, curtidas });
  }

  const rotulo = `${estado.curtidas} ${estado.curtidas === 1 ? "curtida" : "curtidas"}`;
  // Ninguém curte o próprio post: o autor só vê a contagem.
  if (meu) {
    return (
      <span className="inline-flex min-h-11 items-center gap-2 px-3 text-small text-text-muted">
        <Icon icon={Heart} />
        {estado.curtidas} <span className="sr-only">{estado.curtidas === 1 ? "curtida" : "curtidas"}</span>
      </span>
    );
  }

  function alternar() {
    if (!podeInteragir()) return;
    const novo = !estado.curtido;
    setEstado((e) => ({ curtido: novo, curtidas: Math.max(0, e.curtidas + (novo ? 1 : -1)) }));
    startTransition(async () => {
      const r = await curtir(postId, novo);
      if ("erro" in r) setEstado({ curtido: !novo, curtidas: estado.curtidas });
      else setEstado({ curtido: novo, curtidas: r.curtidas });
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={estado.curtido}
      aria-label={`Curtir (${rotulo})`}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-small transition-colors hover:bg-background",
        estado.curtido ? "font-semibold text-primary" : "text-text-muted",
      )}
    >
      <Icon icon={Heart} className={estado.curtido ? "fill-current" : undefined} />
      <span aria-hidden="true">{estado.curtidas}</span>
    </button>
  );
}

function MenuAutor({ post, completo, aoExcluir }: { post: PostResumo; completo: boolean; aoExcluir?: () => void }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => !caixa.current?.contains(e.target as Node) && fechar();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    setConfirmar(false);
    setErro(null);
  }

  function fixar() {
    startTransition(async () => {
      const r = await alternarFixado(post.id, !post.fixado);
      if ("erro" in r) return setErro(r.erro);
      fechar();
      router.refresh();
    });
  }

  function excluir() {
    startTransition(async () => {
      const r = await excluirPost(post.id);
      if ("erro" in r) return setErro(r.erro);
      fechar();
      if (completo) router.replace("/rede");
      else {
        aoExcluir?.();
        router.refresh();
      }
    });
  }

  return (
    <div ref={caixa} className="relative -mt-2 -mr-2 shrink-0">
      <Button
        variant="ghost"
        iconOnly
        aria-label="Opções da publicação"
        aria-expanded={aberto}
        aria-controls={menuId}
        onClick={() => (aberto ? fechar() : setAberto(true))}
      >
        <Icon icon={MoreHorizontal} />
      </Button>
      {aberto && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-20 mt-1 w-64 space-y-1 rounded-card border border-border bg-surface p-2 shadow-overlay"
        >
          {confirmar ? (
            <div className="space-y-2 p-2">
              <p className="text-small text-text">Excluir esta publicação? As fotos, curtidas e comentários saem junto.</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setConfirmar(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="danger" onClick={excluir} disabled={pendente} className="flex-1">
                  Excluir
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ButtonLink href={`/rede/post/${post.id}/editar`} variant="ghost" block className="justify-start text-text">
                <Icon icon={Pencil} /> Editar
              </ButtonLink>
              <Button variant="ghost" block onClick={fixar} disabled={pendente} className="justify-start text-text">
                <Icon icon={post.fixado ? PinOff : Pin} />
                {post.fixado ? "Desafixar do perfil" : "Fixar no perfil"}
              </Button>
              <Button variant="ghost" block onClick={() => setConfirmar(true)} className="justify-start text-error-strong">
                <Icon icon={Trash2} /> Excluir
              </Button>
            </>
          )}
          {erro && (
            <p role="alert" className="p-2 text-small text-error-strong">
              {erro}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
