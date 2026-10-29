import { ArrowLeft, AtSign, BadgeCheck, House, MapPin, MessageCircle, Video } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { BotaoContato } from "@/components/BotaoContato";
import { EsqueletoPerfil } from "@/components/Esqueletos";
import { nomeLocal } from "@/components/Resultados";
import { SeloDemo } from "@/components/SeloDemo";
import { Badge, ButtonLink, Card, Icon, buttonClasses } from "@/components/ui";
import { getCatalogos } from "@/lib/catalogos";
import {
  linkInstagram,
  linkMaps,
  linkWhatsApp,
  mensagemWhatsApp,
  type EventoContato,
} from "@/lib/contato";
import { filtrosParaLog, parseFiltros, temFiltros, urlBusca } from "@/lib/filtros";
import { faixaPreco, listaNatural } from "@/lib/formato";
import { getVeterinario, type Veterinario } from "@/lib/veterinarios";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const vet = await getVeterinario(slug);
  if (!vet) return { title: "Perfil não encontrado" };
  const principal = vet.areas.find((a) => a.principal)?.nome;
  const titulo = principal ? `${vet.nome}, ${principal}` : vet.nome;
  const onde = vet.locais[0]?.regiao.nome ?? vet.cobertura[0]?.nome;
  const descricao = vet.bio
    ? vet.bio.length > 160
      ? `${vet.bio.slice(0, 157).trimEnd()}...`
      : vet.bio
    : `${vet.nome}${onde ? ` atende em ${onde}` : ""}. Veja serviços, preços e fale pelo WhatsApp.`;
  const url = `/vet/${vet.slug}`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: titulo, description: descricao, url },
    // Perfis fictícios não devem aparecer em buscadores.
    robots: vet.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default function PaginaPerfil({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <Suspense fallback={<EsqueletoPerfil />}>
      <Perfil params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Perfil({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, sp, catalogos] = await Promise.all([params, searchParams, getCatalogos()]);
  const vet = await getVeterinario(slug);
  if (!vet) notFound();

  const filtros = parseFiltros(sp, catalogos);
  const filtrosLog = filtrosParaLog(filtros);
  const evento = (canal: EventoContato["canal"]): EventoContato => ({
    veterinarian_id: vet.id,
    canal,
    origem: "perfil",
    filtros: filtrosLog,
  });
  // Demo: o botão aparece (e abre o aviso), mas o número fictício nunca vira link.
  const whatsapp = !vet.whatsapp
    ? null
    : vet.isDemo
      ? ""
      : linkWhatsApp(
          vet.whatsapp,
          mensagemWhatsApp({
            nome: vet.nome,
            servico: filtros.servico,
            especie: filtros.especie,
            local: nomeLocal(filtros, catalogos),
          }),
        );

  const principal = vet.areas.find((a) => a.principal) ?? vet.areas[0];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-6 sm:px-6 md:pb-8 lg:pt-6 lg:pb-16">
        <ButtonLink href={temFiltros(filtros) ? urlBusca(filtros) : "/buscar"} variant="ghost" className="-ml-4">
          <Icon icon={ArrowLeft} />
          {temFiltros(filtros) ? "Voltar aos resultados" : "Buscar veterinários"}
        </ButtonLink>
  
        {vet.isDemo && (
          <p className="mt-4 rounded-control bg-accent-soft px-4 py-3 text-small text-accent-strong">
            Este é um perfil de demonstração: o profissional é fictício e serve para mostrar como o VetMeet funciona.
          </p>
        )}
  
        <Card as="header" padding="lg" className="mt-4 flex gap-4 sm:items-center sm:gap-6">
          <Avatar nome={vet.nome} fotoUrl={vet.fotoUrl} tamanho="lg" />
          <div className="min-w-0">
            <h1 className="text-h1 text-text">{vet.nome}</h1>
            {principal && <p className="mt-1 text-body text-text">{principal.nome}</p>}
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-muted">
              <span>{vet.crmv}</span>
              {vet.crmvVerificado ? (
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <Icon icon={BadgeCheck} size="sm" /> CRMV verificado
                </span>
              ) : (
                !vet.isDemo && <span>(informado pelo profissional)</span>
              )}
              {vet.anosExperiencia != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {vet.anosExperiencia} {vet.anosExperiencia === 1 ? "ano" : "anos"} de experiência
                  </span>
                </>
              )}
            </p>
            {vet.isDemo && (
              <div className="mt-2">
                <SeloDemo />
              </div>
            )}
          </div>
        </Card>
  
        <div className="mt-6 grid gap-6 md:mt-8 md:gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-6 md:space-y-8">
            {vet.bio && (
              <Secao slug={vet.slug} titulo="Sobre">
                <p className="text-body whitespace-pre-line text-text">{vet.bio}</p>
              </Secao>
            )}
  
            <Secao slug={vet.slug} titulo="Atende">
              <div className="flex flex-wrap gap-2">
                {vet.especies.map((e) => (
                  <Badge key={e.slug}>{e.nome}</Badge>
                ))}
              </div>
              {vet.areas.length > 0 && (
                <>
                  <h3 className="mt-5 text-small font-semibold text-text">Áreas de atuação</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {vet.areas.map((a) => (
                      <li key={a.slug}>
                        <Badge variant={a.principal ? "primary" : "neutral"}>{a.nome}</Badge>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Secao>
  
            <Atendimento vet={vet} />
  
            {vet.servicos.length > 0 && <Servicos vet={vet} destaque={filtros.servico} />}
  
            {vet.pagamentos.length > 0 && (
              <Secao slug={vet.slug} titulo="Formas de pagamento">
                <ul className="flex flex-wrap gap-2">
                  {vet.pagamentos.map((p) => (
                    <li key={p.slug}>
                      <Badge>
                        {p.slug === "parcelamento" && p.parcelasMax ? `Parcelamento em até ${p.parcelasMax}x` : p.nome}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Secao>
            )}
          </div>
  
          <Contato vet={vet} whatsapp={whatsapp} evento={evento} />
        </div>
      </div>

      {/* Celular: WhatsApp sempre à mão ao rolar. Sticky (e não fixed) dentro do
          <main>: acompanha a tela, mas para no fim do conteúdo, sem cobrir o rodapé. */}
      {whatsapp !== null && (
        <div className="sticky bottom-0 z-40 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <BotaoContato
            demo={vet.isDemo}
            href={whatsapp}
            evento={evento("whatsapp")}
            className={buttonClasses({ variant: "whatsapp", size: "lg", block: true })}
          >
            <Icon icon={MessageCircle} />
            Chamar no WhatsApp
          </BotaoContato>
        </div>
      )}
    </>
  );
}

// Ids com o slug: com Cache Components o perfil visto antes continua no DOM,
// escondido, e um id repetido faria o aria-labelledby apontar para ele.
function Secao({ slug, titulo, children }: { slug: string; titulo: string; children: ReactNode }) {
  const id = `${slug}-${titulo.toLowerCase().normalize("NFD").replace(/[^a-z]+/g, "-")}`;
  return (
    <Card as="section" padding="lg" aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-h3 text-text">
        {titulo}
      </h2>
      {children}
    </Card>
  );
}

function Atendimento({ vet }: { vet: Veterinario }) {
  const tem = (slug: string) => vet.modos.some((m) => m.slug === slug);
  const disponibilidade = [
    vet.emergencia && "Emergência",
    vet.fimDeSemana && "Fim de semana",
    vet.noturno && "Noturno",
  ].filter((d): d is string => Boolean(d));

  return (
    <Secao slug={vet.slug} titulo="Atendimento">
      <ul className="space-y-4 text-text">
        {vet.locais.map((l) => (
          <li key={l.id} className="flex gap-3">
            <Icon icon={MapPin} className="mt-0.5 text-primary" />
            <div>
              <p className="text-body font-medium text-text">{l.nome}</p>
              <p className="text-small text-text-muted">
                {[l.endereco, l.bairro?.nome, l.regiao.nome].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        ))}
        {tem("domiciliar") && vet.cobertura.length > 0 && (
          <li className="flex gap-3">
            <Icon icon={House} className="mt-0.5 text-primary" />
            <div>
              <p className="text-body font-medium text-text">Atendimento em casa</p>
              <p className="text-small text-text-muted">{listaNatural(vet.cobertura.map((c) => c.nome))}</p>
            </div>
          </li>
        )}
        {tem("teleorientacao") && (
          <li className="flex gap-3">
            <Icon icon={Video} className="mt-0.5 text-primary" />
            <div>
              <p className="text-body font-medium text-text">Teleorientação</p>
              <p className="text-small text-text-muted">Orientação por videochamada</p>
            </div>
          </li>
        )}
      </ul>
      {disponibilidade.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-small text-text-muted">Disponível para:</span>
          {disponibilidade.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </div>
      )}
    </Secao>
  );
}

function Servicos({ vet, destaque }: { vet: Veterinario; destaque?: string }) {
  return (
    <Secao slug={vet.slug} titulo="Serviços e preços">
      <ul className="divide-y divide-border">
        {vet.servicos.map((s) => (
          <li
            key={s.slug}
            className={`flex items-baseline justify-between gap-4 py-3 text-body ${
              s.slug === destaque ? "-mx-3 rounded-control bg-primary-soft px-3 font-medium" : ""
            }`}
          >
            <span className="text-text">{s.nome}</span>
            <span className="shrink-0 text-right text-text tabular-nums">{faixaPreco(s.min, s.max) ?? "Sob consulta"}</span>
          </li>
        ))}
      </ul>
      {vet.servicos.some((s) => s.slug === "castracao-cao") && (
        <p className="mt-3 text-caption text-text-muted">Castração de cães varia conforme o porte.</p>
      )}
    </Secao>
  );
}

function Contato({
  vet,
  whatsapp,
  evento,
}: {
  vet: Veterinario;
  whatsapp: string | null;
  evento: (canal: EventoContato["canal"]) => EventoContato;
}) {
  return (
    <Card as="section" padding="lg" aria-labelledby={`${vet.slug}-contato`} className="lg:sticky lg:top-6">
      <h2 id={`${vet.slug}-contato`} className="text-h3 text-text">
        Contato
      </h2>
      {vet.consulta.min != null && (
        <p className="mt-1 text-small text-text-muted">
          Consulta: <span className="font-semibold text-text">{faixaPreco(vet.consulta.min, vet.consulta.max)}</span>
        </p>
      )}

      <div className="mt-4 space-y-2">
        {whatsapp !== null && (
          <BotaoContato
            demo={vet.isDemo}
            href={whatsapp}
            evento={evento("whatsapp")}
            className={buttonClasses({ variant: "whatsapp", size: "lg", block: true })}
          >
            <Icon icon={MessageCircle} />
            Chamar no WhatsApp
          </BotaoContato>
        )}
        {vet.instagram && (
          <BotaoContato
            demo={vet.isDemo}
            href={vet.isDemo ? "" : linkInstagram(vet.instagram)}
            evento={evento("instagram")}
            className={buttonClasses({ variant: "secondary", block: true })}
          >
            <Icon icon={AtSign} />
            Instagram @{vet.instagram}
          </BotaoContato>
        )}
      </div>

      {vet.locais.length > 0 && (
        <ul className="mt-5 space-y-4 border-t border-border pt-5">
          {vet.locais.map((l) => (
            <li key={l.id}>
              <p className="text-small font-medium text-text">{l.nome}</p>
              <p className="text-small text-text-muted">
                {[l.endereco, l.bairro?.nome, l.regiao.nome].filter(Boolean).join(", ")}
              </p>
              {/* Sem endereço nem coordenada o Maps só mostraria a cidade: melhor não oferecer. */}
              {(l.endereco || l.lat != null) && (
                <BotaoContato
                  demo={vet.isDemo}
                  href={
                    vet.isDemo
                      ? ""
                      : linkMaps({
                          lat: l.lat,
                          lng: l.lng,
                          endereco: l.endereco,
                          bairro: l.bairro?.nome ?? null,
                          cidade: l.regiao.nome,
                        })
                  }
                  evento={evento("maps")}
                  className={`${buttonClasses({ variant: "ghost" })} -ml-4 mt-1`}
                >
                  <Icon icon={MapPin} />
                  Ver no Google Maps
                </BotaoContato>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
