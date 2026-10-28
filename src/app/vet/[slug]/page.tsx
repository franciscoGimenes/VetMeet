import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { BotaoContato } from "@/components/BotaoContato";
import { EsqueletoPerfil } from "@/components/Esqueletos";
import { BOTAO_SECUNDARIO, BOTAO_WHATSAPP, CHIP } from "@/components/estilos";
import {
  IconeCasa,
  IconeConversa,
  IconeInstagram,
  IconeLocal,
  IconeVerificado,
  IconeVideo,
  IconeVoltar,
} from "@/components/icones";
import { nomeLocal } from "@/components/Resultados";
import { SeloDemo } from "@/components/SeloDemo";
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
  return {
    title: principal ? `${vet.nome}, ${principal}` : vet.nome,
    description: vet.bio?.slice(0, 160),
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
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-16">
      <Link
        href={temFiltros(filtros) ? urlBusca(filtros) : "/buscar"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <IconeVoltar /> {temFiltros(filtros) ? "Voltar aos resultados" : "Buscar veterinários"}
      </Link>

      {vet.isDemo && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 ring-inset">
          Este é um perfil de demonstração: o profissional é fictício e serve para mostrar como o VetMeet funciona.
        </p>
      )}

      <header className="mt-4 flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:items-center sm:gap-6 sm:p-6">
        <Avatar nome={vet.nome} fotoUrl={vet.fotoUrl} tamanho="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{vet.nome}</h1>
          {principal && <p className="mt-1 text-base text-slate-700">{principal.nome}</p>}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
            <span>{vet.crmv}</span>
            {vet.crmvVerificado && (
              <span className="inline-flex items-center gap-1 font-medium text-marca-800">
                <IconeVerificado /> CRMV verificado
              </span>
            )}
            {vet.anosExperiencia != null && (
              <>
                <span className="text-slate-300">·</span>
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
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6">
          {vet.bio && (
            <Secao titulo="Sobre">
              <p className="leading-relaxed whitespace-pre-line text-slate-700">{vet.bio}</p>
            </Secao>
          )}

          <Secao titulo="Atende">
            <div className="flex flex-wrap gap-2">
              {vet.especies.map((e) => (
                <span key={e.slug} className={`${CHIP} text-sm`}>
                  {e.nome}
                </span>
              ))}
            </div>
            {vet.areas.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-slate-900">Áreas de atuação</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {vet.areas.map((a) => (
                    <li
                      key={a.slug}
                      className={
                        a.principal
                          ? "rounded-full bg-marca-50 px-3 py-1 text-sm font-medium text-marca-900 ring-1 ring-marca-200 ring-inset"
                          : `${CHIP} text-sm`
                      }
                    >
                      {a.nome}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Secao>

          <Atendimento vet={vet} />

          {vet.servicos.length > 0 && <Servicos vet={vet} destaque={filtros.servico} />}

          {vet.pagamentos.length > 0 && (
            <Secao titulo="Formas de pagamento">
              <ul className="flex flex-wrap gap-2">
                {vet.pagamentos.map((p) => (
                  <li key={p.slug} className={`${CHIP} text-sm`}>
                    {p.slug === "parcelamento" && p.parcelasMax ? `Parcelamento em até ${p.parcelasMax}x` : p.nome}
                  </li>
                ))}
              </ul>
            </Secao>
          )}
        </div>

        <Contato vet={vet} whatsapp={whatsapp} evento={evento} />
      </div>

      {/* Celular: WhatsApp sempre à mão ao rolar */}
      {whatsapp !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <BotaoContato
            demo={vet.isDemo}
            href={whatsapp}
            evento={evento("whatsapp")}
            className={`${BOTAO_WHATSAPP} w-full py-3 text-base`}
          >
            <IconeConversa className="text-lg" />
            Chamar no WhatsApp
          </BotaoContato>
        </div>
      )}
    </div>
  );
}

function Secao({ titulo, id, children }: { titulo: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? titulo}-titulo`} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 id={`${id ?? titulo}-titulo`} className="mb-3 text-lg font-semibold text-slate-900">
        {titulo}
      </h2>
      {children}
    </section>
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
    <Secao titulo="Atendimento">
      <ul className="space-y-4 text-slate-700">
        {vet.locais.map((l) => (
          <li key={l.id} className="flex gap-3">
            <IconeLocal className="mt-1 shrink-0 text-lg text-marca-700" />
            <div>
              <p className="font-medium text-slate-900">{l.nome}</p>
              <p className="text-sm">
                {[l.endereco, l.bairro?.nome, l.regiao.nome].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        ))}
        {tem("domiciliar") && vet.cobertura.length > 0 && (
          <li className="flex gap-3">
            <IconeCasa className="mt-1 shrink-0 text-lg text-marca-700" />
            <div>
              <p className="font-medium text-slate-900">Atendimento em casa</p>
              <p className="text-sm">{listaNatural(vet.cobertura.map((c) => c.nome))}</p>
            </div>
          </li>
        )}
        {tem("teleorientacao") && (
          <li className="flex gap-3">
            <IconeVideo className="mt-1 shrink-0 text-lg text-marca-700" />
            <div>
              <p className="font-medium text-slate-900">Teleorientação</p>
              <p className="text-sm">Orientação por videochamada</p>
            </div>
          </li>
        )}
      </ul>
      {disponibilidade.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Disponível para:</span>
          {disponibilidade.map((d) => (
            <span key={d} className={`${CHIP} text-sm`}>
              {d}
            </span>
          ))}
        </div>
      )}
    </Secao>
  );
}

function Servicos({ vet, destaque }: { vet: Veterinario; destaque?: string }) {
  return (
    <Secao titulo="Serviços e preços">
      <ul className="divide-y divide-slate-100">
        {vet.servicos.map((s) => (
          <li
            key={s.slug}
            className={`flex items-baseline justify-between gap-4 py-2.5 ${
              s.slug === destaque ? "-mx-3 rounded-lg bg-marca-50 px-3 font-medium" : ""
            }`}
          >
            <span className="text-slate-800">{s.nome}</span>
            <span className="shrink-0 text-right text-slate-900 tabular-nums">
              {faixaPreco(s.min, s.max) ?? "Sob consulta"}
            </span>
          </li>
        ))}
      </ul>
      {vet.servicos.some((s) => s.slug === "castracao-cao") && (
        <p className="mt-3 text-xs text-slate-500">Castração de cães varia conforme o porte.</p>
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
    <section
      id="contato"
      aria-labelledby="contato-titulo"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-6"
    >
      <h2 id="contato-titulo" className="text-lg font-semibold text-slate-900">
        Contato
      </h2>
      {vet.consulta.min != null && (
        <p className="mt-1 text-sm text-slate-600">
          Consulta: <span className="font-semibold text-slate-900">{faixaPreco(vet.consulta.min, vet.consulta.max)}</span>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {whatsapp !== null && (
          <BotaoContato
            demo={vet.isDemo}
            href={whatsapp}
            evento={evento("whatsapp")}
            className={`${BOTAO_WHATSAPP} w-full py-3 text-base`}
          >
            <IconeConversa className="text-lg" />
            Chamar no WhatsApp
          </BotaoContato>
        )}
        {vet.instagram && (
          <BotaoContato
            demo={vet.isDemo}
            href={linkInstagram(vet.instagram)}
            evento={evento("instagram")}
            className={`${BOTAO_SECUNDARIO} w-full text-sm`}
          >
            <IconeInstagram />@{vet.instagram}
          </BotaoContato>
        )}
      </div>

      {vet.locais.length > 0 && (
        <ul className="mt-5 space-y-4 border-t border-slate-100 pt-5">
          {vet.locais.map((l) => (
            <li key={l.id}>
              <p className="text-sm font-medium text-slate-900">{l.nome}</p>
              <p className="text-sm text-slate-600">
                {[l.endereco, l.bairro?.nome, l.regiao.nome].filter(Boolean).join(", ")}
              </p>
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
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-marca-800 underline hover:text-marca-900"
              >
                <IconeLocal /> Ver no Google Maps
              </BotaoContato>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
