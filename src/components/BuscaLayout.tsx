"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "@/components/estilos";
import { IconeFechar, IconeFiltros, IconeLocal } from "@/components/icones";
import type { Catalogos } from "@/lib/catalogos";
import { DISPONIBILIDADES, PRECOS_MAX, type Filtros } from "@/lib/filtros";

const FORM_ID = "busca";
const DESKTOP = "(min-width: 1024px)";

const SELECT =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-marca-600 focus:outline-2 focus:outline-marca-600/30";

// Remonte este componente (via `key`) quando os filtros da URL mudarem, para o
// estado local voltar a refletir a busca atual.
export function BuscaLayout({
  catalogos,
  filtros,
  children,
}: {
  catalogos: Catalogos;
  filtros: Filtros;
  children: ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pendente, startTransition] = useTransition();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [regiao, setRegiao] = useState(filtros.local ?? "");

  const regiaoAtual = catalogos.regioes.find((r) => r.slug === regiao);
  const bairros = regiaoAtual ? catalogos.bairros.filter((b) => b.region_id === regiaoAtual.id) : [];
  const qtdFiltros =
    [filtros.especie, filtros.servico, filtros.area, filtros.preco].filter(Boolean).length +
    filtros.modo.length +
    filtros.disp.length +
    filtros.pagamento.length;

  function enviar({ semBairro = false } = {}) {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    for (const [chave, valor] of new FormData(form)) {
      if (typeof valor !== "string" || !valor) continue;
      if (semBairro && chave === "bairro") continue;
      params.append(chave, valor);
    }
    setGavetaAberta(false);
    startTransition(() => router.push(params.size ? `/buscar?${params}` : "/buscar"));
  }

  const noDesktop = () => window.matchMedia(DESKTOP).matches;

  // Gaveta aberta no celular: trava a rolagem do fundo e fecha com Esc.
  useEffect(() => {
    if (!gavetaAberta) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setGavetaAberta(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fechar);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fechar);
    };
  }, [gavetaAberta]);

  const macros = [
    { chave: "alto_tiete", nome: "Alto Tietê" },
    { chave: "zona_leste_sp", nome: "Zona Leste de São Paulo" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* Localização: sempre visível, acima dos resultados */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:rounded-2xl lg:border lg:bg-white lg:p-4 lg:shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <IconeLocal /> Cidade ou região
            </span>
            <select
              name="local"
              form={FORM_ID}
              value={regiao}
              onChange={(e) => {
                setRegiao(e.target.value);
                queueMicrotask(() => enviar({ semBairro: true }));
              }}
              className={SELECT}
            >
              <option value="">Toda a região</option>
              {macros.map((m) => (
                <optgroup key={m.chave} label={m.nome}>
                  {catalogos.regioes
                    .filter((r) => r.regiao_macro === m.chave)
                    .map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.nome}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          {bairros.length > 1 && (
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-600">Bairro</span>
              <select
                key={regiao}
                name="bairro"
                form={FORM_ID}
                defaultValue={regiao === filtros.local ? filtros.bairro ?? "" : ""}
                onChange={() => enviar()}
                className={SELECT}
              >
                <option value="">Todos os bairros</option>
                {bairros.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => setGavetaAberta(true)}
            className={`${BOTAO_SECUNDARIO} text-sm lg:hidden`}
          >
            <IconeFiltros />
            Filtros
            {qtdFiltros > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-marca-700 text-xs text-white">
                {qtdFiltros}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 lg:mt-0 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        {/* Filtros: gaveta no celular, barra lateral no desktop */}
        <aside
          aria-label="Filtros"
          className={
            gavetaAberta
              ? "fixed inset-0 z-50 flex flex-col bg-white lg:static lg:z-auto"
              : "hidden lg:block"
          }
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden">
            <h2 className="text-base font-semibold">Filtros</h2>
            <button
              type="button"
              onClick={() => setGavetaAberta(false)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Fechar filtros"
            >
              <IconeFechar className="text-xl" />
            </button>
          </div>

          <form
            id={FORM_ID}
            ref={formRef}
            action="/buscar"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
            onChange={() => noDesktop() && enviar()}
            className="flex-1 space-y-6 overflow-y-auto px-4 py-5 lg:sticky lg:top-6 lg:overflow-visible lg:px-0 lg:py-0"
          >
            <Grupo titulo="Espécie">
              <div className="flex flex-wrap gap-2">
                <Pilula name="especie" value="" rotulo="Todas" marcado={!filtros.especie} />
                {catalogos.especies.map((e) => (
                  <Pilula
                    key={e.slug}
                    name="especie"
                    value={e.slug}
                    rotulo={e.slug === "exoticos" ? "Exóticos" : e.nome}
                    marcado={filtros.especie === e.slug}
                  />
                ))}
              </div>
            </Grupo>

            <Grupo titulo="Serviço" htmlFor="f-servico">
              <select id="f-servico" name="servico" defaultValue={filtros.servico ?? ""} className={SELECT}>
                <option value="">Qualquer serviço</option>
                {catalogos.servicos.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </Grupo>

            <Grupo titulo="Modalidade">
              {catalogos.modos.map((m) => (
                <Caixa key={m.slug} name="modo" value={m.slug} rotulo={m.nome} marcado={filtros.modo.includes(m.slug)} />
              ))}
            </Grupo>

            <Grupo titulo="Área de atuação" htmlFor="f-area">
              <select id="f-area" name="area" defaultValue={filtros.area ?? ""} className={SELECT}>
                <option value="">Qualquer área</option>
                {catalogos.areas.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </Grupo>

            <Grupo titulo="Disponibilidade">
              {DISPONIBILIDADES.map((d) => (
                <Caixa key={d.slug} name="disp" value={d.slug} rotulo={d.nome} marcado={filtros.disp.includes(d.slug)} />
              ))}
            </Grupo>

            <Grupo titulo="Preço da consulta">
              <div className="flex flex-wrap gap-2">
                <Pilula name="preco" value="" rotulo="Qualquer" marcado={!filtros.preco} />
                {PRECOS_MAX.map((p) => (
                  <Pilula key={p} name="preco" value={String(p)} rotulo={`Até R$ ${p}`} marcado={filtros.preco === p} />
                ))}
              </div>
            </Grupo>

            <Grupo titulo="Forma de pagamento">
              {catalogos.pagamentos.map((p) => (
                <Caixa key={p.slug} name="pagamento" value={p.slug} rotulo={p.nome} marcado={filtros.pagamento.includes(p.slug)} />
              ))}
            </Grupo>

            <noscript>
              <button className={`${BOTAO_PRIMARIO} w-full`}>Aplicar filtros</button>
            </noscript>
          </form>

          <div className="flex gap-3 border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
            <button
              type="button"
              className={`${BOTAO_SECUNDARIO} flex-1`}
              onClick={() => {
                setGavetaAberta(false);
                startTransition(() => router.push(regiao ? `/buscar?local=${regiao}` : "/buscar"));
              }}
            >
              Limpar
            </button>
            <button type="submit" form={FORM_ID} className={`${BOTAO_PRIMARIO} flex-1`}>
              Ver resultados
            </button>
          </div>
        </aside>

        <section
          aria-label="Resultados"
          aria-busy={pendente}
          className={`min-w-0 transition-opacity ${pendente ? "opacity-50" : ""}`}
        >
          {children}
        </section>
      </div>
    </div>
  );
}

const TITULO_GRUPO = "mb-2 block text-sm font-semibold text-slate-900";

function Grupo({ titulo, htmlFor, children }: { titulo: string; htmlFor?: string; children: ReactNode }) {
  if (htmlFor) {
    return (
      <div>
        <label htmlFor={htmlFor} className={TITULO_GRUPO}>
          {titulo}
        </label>
        {children}
      </div>
    );
  }
  return (
    <fieldset>
      <legend className={TITULO_GRUPO}>{titulo}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Pilula({ name, value, rotulo, marcado }: { name: string; value: string; rotulo: string; marcado: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={marcado} className="peer sr-only" />
      <span className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors peer-checked:border-marca-700 peer-checked:bg-marca-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marca-700 hover:border-slate-400">
        {rotulo}
      </span>
    </label>
  );
}

function Caixa({ name, value, rotulo, marcado }: { name: string; value: string; rotulo: string; marcado: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={marcado}
        className="size-4 rounded border-slate-300 accent-marca-700"
      />
      {rotulo}
    </label>
  );
}
