import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoConta } from "@/components/Esqueletos";
import { FormPost } from "@/components/rede/FormPost";
import { ButtonLink, Icon } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import { exigirSessao } from "@/lib/conta";
import { eUuid, urlFotoRede } from "@/lib/rede";

export const metadata: Metadata = { title: "Editar publicação", robots: { index: false, follow: false } };

type Params = Promise<{ id: string }>;

export default function EditarPublicacao({ params }: { params: Params }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16 sm:px-6 lg:pt-6">
      <Suspense fallback={<EsqueletoConta />}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ params }: { params: Params }) {
  const [{ id }, { supabase, user }] = await Promise.all([params, exigirSessao()]);
  if (!eUuid(id)) notFound();
  // Lido com a sessão: o RLS só devolve o post se ele for do usuário (mesmo com o perfil pausado).
  const { data } = await supabase
    .from("posts")
    .select(
      "id, categoria, texto, veterinarians!posts_veterinarian_id_fkey!inner(user_id), post_images(caminho, largura, altura, ordem), post_species(species(slug)), post_services(services(slug))",
    )
    .eq("id", id)
    .eq("veterinarians.user_id", user.id)
    .maybeSingle();
  if (!data) notFound();
  const catalogos = await getCatalogos();

  const post = {
    id: data.id,
    categoria: data.categoria,
    texto: data.texto,
    fotos: [...data.post_images]
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => ({ caminho: f.caminho, url: urlFotoRede(f.caminho), largura: f.largura, altura: f.altura })),
    especies: data.post_species.map((x) => x.species.slug),
    servicos: data.post_services.map((x) => x.services.slug),
  };

  return (
    <>
      <ButtonLink href={`/rede/post/${id}`} variant="ghost" className="-ml-4">
        <Icon icon={ArrowLeft} />
        Publicação
      </ButtonLink>
      <h1 className="mt-2 text-h1 text-text">Editar publicação</h1>
      <div className="mt-6 md:mt-8">
        <FormPost catalogos={catalogos} userId={user.id} post={post} />
      </div>
    </>
  );
}
