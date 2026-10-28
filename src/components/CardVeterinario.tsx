import { MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { BotaoContato } from "@/components/BotaoContato";
import { SeloDemo } from "@/components/SeloDemo";
import { Badge, ButtonLink, Card, Icon, buttonClasses } from "@/components/ui";
import { linkWhatsApp, mensagemWhatsApp } from "@/lib/contato";
import { filtrosParaLog, filtrosParaParams, type Filtros } from "@/lib/filtros";
import { faixaPreco, listaNatural } from "@/lib/formato";
import type { Veterinario } from "@/lib/veterinarios";

export type ContextoBusca = {
  filtros: Filtros;
  // Nome legível do local buscado, ex.: "Suzano" ou "Vila Oliveira, Mogi das Cruzes".
  localNome?: string;
};

// Onde o profissional atende, priorizando o local buscado.
export function resumoLocal(vet: Veterinario, local?: string) {
  const clinica = local ? vet.locais.find((l) => l.regiao.slug === local) : vet.locais[0];
  if (clinica) return [clinica.bairro?.nome, clinica.regiao.nome].filter(Boolean).join(", ");

  const buscada = vet.cobertura.find((c) => c.slug === local);
  const cobertura = local ? (buscada ? [buscada, ...vet.cobertura.filter((c) => c !== buscada)] : []) : vet.cobertura;
  if (cobertura.length) {
    const visiveis = cobertura.slice(0, 2).map((c) => c.nome);
    const resto = cobertura.length - visiveis.length;
    return `Atende em casa: ${visiveis.join(", ")}${resto > 0 ? ` e mais ${resto}` : ""}`;
  }
  return "Teleorientação por vídeo";
}

export function CardVeterinario({ vet, contexto }: { vet: Veterinario; contexto: ContextoBusca }) {
  const { filtros } = contexto;
  const qs = filtrosParaParams(filtros).toString();
  const hrefPerfil = `/vet/${vet.slug}${qs ? `?${qs}` : ""}`;

  const servico = filtros.servico ? vet.servicos.find((s) => s.slug === filtros.servico) : undefined;
  const preco = servico
    ? { rotulo: servico.nome, valor: faixaPreco(servico.min, servico.max) }
    : { rotulo: "Consulta", valor: faixaPreco(vet.consulta.min, vet.consulta.max) };

  const principal = vet.areas.find((a) => a.principal) ?? vet.areas[0];

  return (
    <Card as="article" padding="md" className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Avatar nome={vet.nome} fotoUrl={vet.fotoUrl} />
        <div className="min-w-0">
          <h3 className="text-h3 text-text">
            <Link href={hrefPerfil} className="inline-flex min-h-11 items-center hover:text-primary hover:underline">
              {vet.nome}
            </Link>
          </h3>
          <p className="text-small text-text-muted">
            {principal && (
              <>
                {principal.nome}
                <span aria-hidden="true"> · </span>
              </>
            )}
            {vet.crmv}
          </p>
          {vet.isDemo && (
            <div className="mt-2">
              <SeloDemo />
            </div>
          )}
        </div>
      </div>

      <dl className="space-y-3 text-small">
        <div className="flex items-start gap-2 text-text">
          <dt className="sr-only">Local</dt>
          <Icon icon={MapPin} size="sm" className="mt-0.5 text-text-muted" />
          <dd>{resumoLocal(vet, filtros.local)}</dd>
        </div>
        <div>
          <dt className="sr-only">Espécies atendidas</dt>
          <dd className="flex flex-wrap gap-2">
            {vet.especies.map((e) => (
              <Badge key={e.slug}>{e.slug === "exoticos" ? "Exóticos" : e.nome}</Badge>
            ))}
          </dd>
        </div>
        <div className="text-text-muted">
          <dt className="sr-only">Modalidades</dt>
          <dd>{listaNatural(vet.modos.map((m) => m.nome))}</dd>
        </div>
        {preco.valor && (
          <div className="flex items-baseline justify-between gap-2 border-t border-border pt-3">
            <dt className="text-text-muted">{preco.rotulo}</dt>
            <dd className="font-semibold text-text">{preco.valor}</dd>
          </div>
        )}
      </dl>

      {/* Coluna estreita: os botões descem para linhas próprias em vez de espremer o texto. */}
      <div className="mt-auto flex flex-wrap gap-2">
        {vet.whatsapp && (
          <BotaoContato
            demo={vet.isDemo}
            href={
              vet.isDemo
                ? ""
                : linkWhatsApp(
                    vet.whatsapp,
                    mensagemWhatsApp({
                      nome: vet.nome,
                      servico: filtros.servico,
                      especie: filtros.especie,
                      local: contexto.localNome,
                    }),
                  )
            }
            evento={{
              veterinarian_id: vet.id,
              canal: "whatsapp",
              origem: "card",
              filtros: filtrosParaLog(filtros),
            }}
            className={`${buttonClasses({ variant: "whatsapp" })} grow`}
          >
            <Icon icon={MessageCircle} />
            WhatsApp
          </BotaoContato>
        )}
        <ButtonLink href={hrefPerfil} variant="secondary" className="grow">
          Ver perfil
        </ButtonLink>
      </div>
    </Card>
  );
}
