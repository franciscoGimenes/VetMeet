import { CircleCheck, CircleOff, CirclePause, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { alternarPausa, sairDaConta } from "@/app/conta/actions";
import { ExcluirConta, FotoPerfil } from "@/components/conta/Conta";
import { Alerta } from "@/components/conta/FormsAuth";
import { EsqueletoConta } from "@/components/Esqueletos";
import { Badge, Button, ButtonLink, Card, Icon } from "@/components/ui";
import { etapaDaConta, exigirSessao } from "@/lib/conta";
import { CONTATO_EMAIL } from "@/lib/site";
import type { Veterinario } from "@/lib/veterinarios";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const AVISOS: Record<string, string> = {
  publicado: "Seu perfil está no ar e já aparece na busca.",
  salvo: "Alterações salvas.",
  senha: "Senha alterada.",
};

export default function MinhaConta({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<EsqueletoConta />}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({ searchParams }: { searchParams: SearchParams }) {
  const sessao = await exigirSessao();
  const etapa = await etapaDaConta(sessao);
  if (typeof etapa === "string") redirect(etapa);
  const { perfil } = etapa;

  const sp = await searchParams;
  const aviso = Object.keys(AVISOS).find((k) => sp[k] === "1");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 text-text">Meu perfil</h1>
          <p className="truncate text-small text-text-muted">{sessao.user.email}</p>
        </div>
        <form action={sairDaConta}>
          <Button type="submit" variant="ghost" className="-mr-4">
            Sair
          </Button>
        </form>
      </div>

      {aviso && (
        <div className="mt-6">
          <Alerta tom="ok">{AVISOS[aviso]}</Alerta>
        </div>
      )}

      <Card padding="lg" className="mt-6 md:mt-8">
        <FotoPerfil nome={perfil.nome} fotoUrl={perfil.fotoUrl} userId={sessao.user.id} />
        <div className="mt-6">
          <p className="text-h3 text-text">{perfil.nome}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-small text-text-muted">
            {perfil.crmv}
            <Status status={perfil.status} />
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/conta/perfil">Editar perfil</ButtonLink>
          {perfil.status === "ativo" && (
            <ButtonLink href={`/vet/${perfil.slug}`} variant="secondary">
              <Icon icon={ExternalLink} />
              Ver perfil público
            </ButtonLink>
          )}
        </div>
      </Card>

      <Secao titulo="Aparecer na busca">
        <Visibilidade perfil={perfil} />
      </Secao>

      <Secao titulo="Senha">
        <p className="text-small text-text-muted">
          Se você entra com o LinkedIn, pode criar uma senha para entrar também com e-mail.
        </p>
        <ButtonLink href="/conta/nova-senha" variant="secondary" className="mt-4">
          Alterar senha
        </ButtonLink>
      </Secao>

      <Secao titulo="Excluir conta">
        <p className="mb-4 text-small text-text-muted">Apaga sua conta e todos os dados do seu perfil.</p>
        <ExcluirConta />
      </Secao>
    </>
  );
}

function Status({ status }: { status: Veterinario["status"] }) {
  if (status === "ativo") {
    return (
      <Badge variant="success">
        <Icon icon={CircleCheck} size="sm" /> No ar
      </Badge>
    );
  }
  if (status === "pausado") {
    return (
      <Badge variant="warning">
        <Icon icon={CirclePause} size="sm" /> Pausado
      </Badge>
    );
  }
  return (
    <Badge variant="error">
      <Icon icon={CircleOff} size="sm" /> Fora do ar
    </Badge>
  );
}

function Visibilidade({ perfil }: { perfil: Veterinario }) {
  if (perfil.status !== "ativo" && perfil.status !== "pausado") {
    return (
      <p className="text-small text-text">
        Seu perfil foi tirado do ar pela equipe do VetMeet.
        {CONTATO_EMAIL && ` Para saber o motivo ou pedir a revisão, escreva para ${CONTATO_EMAIL}.`}
      </p>
    );
  }
  const ativo = perfil.status === "ativo";
  return (
    <>
      <p className="text-small text-text-muted">
        {ativo
          ? "Pausar tira seu perfil da busca e do endereço público, sem apagar nada. Você volta quando quiser."
          : "Seu perfil está pausado: não aparece na busca e o endereço público fica fora do ar."}
      </p>
      <form action={alternarPausa} className="mt-4">
        <Button type="submit" variant="secondary">
          {ativo ? "Pausar perfil" : "Voltar a aparecer na busca"}
        </Button>
      </form>
    </>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card as="section" padding="lg" className="mt-6 md:mt-8">
      <h2 className="mb-2 text-h3 text-text">{titulo}</h2>
      {children}
    </Card>
  );
}
