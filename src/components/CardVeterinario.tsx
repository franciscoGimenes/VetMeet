import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { BotaoContato } from "@/components/BotaoContato";
import { BOTAO_SECUNDARIO, BOTAO_WHATSAPP, CHIP } from "@/components/estilos";
import { IconeConversa, IconeLocal } from "@/components/icones";
import { SeloDemo } from "@/components/SeloDemo";
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
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex gap-3">
        <Avatar nome={vet.nome} fotoUrl={vet.fotoUrl} />
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold text-slate-900">
            <Link href={hrefPerfil} className="hover:text-marca-800 hover:underline">
              {vet.nome}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">
            {principal?.nome}
            <span className="text-slate-400"> · </span>
            {vet.crmv}
          </p>
          {vet.isDemo && (
            <div className="mt-1.5">
              <SeloDemo />
            </div>
          )}
        </div>
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex items-start gap-2 text-slate-700">
          <dt className="sr-only">Local</dt>
          <IconeLocal className="mt-0.5 shrink-0 text-slate-400" />
          <dd>{resumoLocal(vet, filtros.local)}</dd>
        </div>
        <div>
          <dt className="sr-only">Espécies atendidas</dt>
          <dd className="flex flex-wrap gap-1.5">
            {vet.especies.map((e) => (
              <span key={e.slug} className={CHIP}>
                {e.slug === "exoticos" ? "Exóticos" : e.nome}
              </span>
            ))}
          </dd>
        </div>
        <div className="text-slate-600">
          <dt className="sr-only">Modalidades</dt>
          <dd>{listaNatural(vet.modos.map((m) => m.nome))}</dd>
        </div>
        {preco.valor && (
          <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2.5">
            <dt className="text-slate-600">{preco.rotulo}</dt>
            <dd className="font-semibold text-slate-900">{preco.valor}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex gap-2">
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
            className={`${BOTAO_WHATSAPP} flex-1 text-sm`}
          >
            <IconeConversa className="text-base" />
            WhatsApp
          </BotaoContato>
        )}
        <Link href={hrefPerfil} className={`${BOTAO_SECUNDARIO} flex-1 text-sm`}>
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
