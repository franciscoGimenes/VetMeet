import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormPerfil } from "@/components/conta/FormPerfil";
import { EsqueletoConta } from "@/components/Esqueletos";
import { ButtonLink, Icon } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import { exigirSessao, getMeuPerfil, temAceiteAtual } from "@/lib/conta";
import { dadosDoPerfil } from "@/lib/perfil";

export const metadata = { title: "Editar perfil" };

export default function EditarPerfil() {
  return (
    <Suspense fallback={<EsqueletoConta />}>
      <Conteudo />
    </Suspense>
  );
}

async function Conteudo() {
  const sessao = await exigirSessao();
  if (!(await temAceiteAtual(sessao))) redirect("/conta/aceite");
  const [perfil, catalogos] = await Promise.all([getMeuPerfil(sessao), getCatalogos()]);
  // Nome sugerido no primeiro acesso: o que veio do LinkedIn, se houver.
  const meta = sessao.user.user_metadata as { name?: string; full_name?: string };
  const inicial = dadosDoPerfil(perfil, meta.name ?? meta.full_name ?? "");

  return (
    <>
      {perfil && (
        <ButtonLink href="/conta" variant="ghost" className="-ml-4">
          <Icon icon={ArrowLeft} />
          Meu perfil
        </ButtonLink>
      )}
      <h1 className="mt-2 text-h1 text-text">{perfil ? "Editar perfil" : "Monte seu perfil"}</h1>
      <p className="mt-2 text-body text-text-muted">
        {perfil
          ? "As mudanças aparecem no seu perfil público assim que você salvar."
          : "É o que tutores vão ver na busca. Os campos opcionais podem ficar para depois."}
      </p>
      <div className="mt-6 md:mt-8">
        <FormPerfil catalogos={catalogos} inicial={inicial} novo={!perfil} />
      </div>
    </>
  );
}
