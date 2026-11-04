import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoPaginaPost } from "@/components/Esqueletos";
import { CardPost } from "@/components/rede/CardPost";
import { Comentarios } from "@/components/rede/Comentarios";
import { RedeProvider } from "@/components/rede/RedeContexto";
import { ButtonLink, Icon } from "@/components/ui";
import { getComentarios, getPost } from "@/lib/posts";
import { nomeCategoria } from "@/lib/rede";
import { curtidosPor, getVisitante } from "@/lib/visitante";

type Params = Promise<{ id: string }>;

function resumo(texto: string, max: number) {
  const t = texto.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 3).trimEnd()}...` : t;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Publicação não encontrada" };
  const titulo = `${resumo(post.texto, 60)} | ${post.autor.nome}`;
  const descricao = `${nomeCategoria(post.categoria)} por ${post.autor.nome} (${post.autor.crmv}): ${resumo(post.texto, 140)}`;
  const url = `/rede/post/${post.id}`;
  const foto = post.fotos[0];
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: titulo,
      description: descricao,
      url,
      publishedTime: post.criadoEm,
      ...(post.editadoEm ? { modifiedTime: post.editadoEm } : {}),
      // Sem foto: fica a imagem padrão do site.
      ...(foto ? { images: [{ url: foto.url, width: foto.largura, height: foto.altura }] } : {}),
    },
    // Posts de demonstração não vão para buscadores.
    robots: post.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default function PaginaPost({ params }: { params: Params }) {
  return (
    <Suspense fallback={<EsqueletoPaginaPost />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Params }) {
  const { id } = await params;
  const [post, visitante] = await Promise.all([getPost(id), getVisitante()]);
  if (!post) notFound();
  const [comentarios, curtidos] = await Promise.all([getComentarios(post.id), curtidosPor(visitante, [post.id])]);

  return (
    <RedeProvider visitante={visitante}>
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16 sm:px-6 lg:pt-6">
        <ButtonLink href="/rede" variant="ghost" className="-ml-4">
          <Icon icon={ArrowLeft} />
          Rede
        </ButtonLink>
        <div className="mt-4 space-y-6 md:space-y-8">
          <CardPost post={post} curtido={curtidos.includes(post.id)} completo />
          <Comentarios postId={post.id} autorDoPost={post.autor.id} comentarios={comentarios} />
        </div>
      </div>
    </RedeProvider>
  );
}
