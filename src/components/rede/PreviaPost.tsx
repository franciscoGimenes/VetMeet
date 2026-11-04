import { Heart, ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Badge, Card, Icon } from "@/components/ui";
import { dataPost, nomeCategoria, type PostResumo } from "@/lib/rede";

// Versão compacta e estática do post (página inicial): o card inteiro leva à publicação.
export function PreviaPost({ post }: { post: PostResumo }) {
  return (
    <Card as="article" padding="lg" className="relative flex h-full flex-col gap-3 hover:border-border-strong">
      <div className="flex items-center gap-3">
        <Avatar nome={post.autor.nome} fotoUrl={post.autor.fotoUrl} tamanho="sm" />
        <div className="min-w-0">
          <p className="truncate text-small font-semibold text-text">{post.autor.nome}</p>
          <p className="text-caption text-text-muted">
            <time dateTime={post.criadoEm}>{dataPost(post.criadoEm)}</time>
          </p>
        </div>
      </div>
      <div>
        <Badge variant="primary">{nomeCategoria(post.categoria)}</Badge>
      </div>
      <h3 className="line-clamp-4 flex-1 text-body text-text">
        <Link href={`/rede/post/${post.id}`} className="after:absolute after:inset-0 after:rounded-card">
          {post.texto}
        </Link>
      </h3>
      <p className="flex items-center gap-4 text-small text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Icon icon={Heart} size="sm" /> {post.curtidas} <span className="sr-only">curtidas</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon icon={MessageSquare} size="sm" /> {post.comentarios} <span className="sr-only">comentários</span>
        </span>
        {post.fotos.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Icon icon={ImageIcon} size="sm" /> {post.fotos.length} <span className="sr-only">fotos</span>
          </span>
        )}
      </p>
    </Card>
  );
}
