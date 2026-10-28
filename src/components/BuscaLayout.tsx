"use client";

import { MapPin, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition, type ReactNode } from "react";
import { Button, Chip, Icon, Select, Sheet } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { DISPONIBILIDADES, PRECOS_MAX, type Filtros } from "@/lib/filtros";

const FORM_ID = "busca";
const DESKTOP = "(min-width: 1024px)";

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

  const fecharGaveta = useCallback(() => setGavetaAberta(false), []);
  const noDesktop = () => window.matchMedia(DESKTOP).matches;

  const macros = [
    { chave: "alto_tiete", nome: "Alto Tietê" },
    { chave: "zona_leste_sp", nome: "Zona Leste de São Paulo" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* Localização: sempre visível, acima dos resultados */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:rounded-card lg:border lg:bg-surface lg:p-4 lg:shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 flex items-center gap-1.5 text-caption font-medium text-text-muted">
              <Icon icon={MapPin} size="sm" /> Cidade ou região
            </span>
            <Select
              name="local"
              form={FORM_ID}
              value={regiao}
              onChange={(e) => {
                setRegiao(e.target.value);
                queueMicrotask(() => enviar({ semBairro: true }));
              }}
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
            </Select>
          </label>
          {bairros.length > 1 && (
            <label className="flex-1">
              <span className="mb-1 block text-caption font-medium text-text-muted">Bairro</span>
              <Select
                key={regiao}
                name="bairro"
                form={FORM_ID}
                defaultValue={regiao === filtros.local ? (filtros.bairro ?? "") : ""}
                onChange={() => enviar()}
              >
                <option value="">Todos os bairros</option>
                {bairros.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.nome}
                  </option>
                ))}
              </Select>
            </label>
          )}
          <Button variant="secondary" onClick={() => setGavetaAberta(true)} className="lg:hidden">
            <Icon icon={SlidersHorizontal} />
            Filtros
            {qtdFiltros > 0 && (
              <span className="grid size-6 place-items-center rounded-pill bg-primary text-caption text-white">
                {qtdFiltros}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 lg:mt-0 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        {/* Filtros: bottom sheet no celular, barra lateral no desktop */}
        <Sheet
          open={gavetaAberta}
          onClose={fecharGaveta}
          title="Filtros"
          estaticoNoDesktop
          footer={
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setGavetaAberta(false);
                  startTransition(() => router.push(regiao ? `/buscar?local=${regiao}` : "/buscar"));
                }}
              >
                Limpar
              </Button>
              <Button type="submit" form={FORM_ID} className="flex-1">
                Ver resultados
              </Button>
            </>
          }
        >
          <form
            id={FORM_ID}
            ref={formRef}
            action="/buscar"
            aria-label="Filtros"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
            onChange={() => noDesktop() && enviar()}
            className="space-y-6 lg:sticky lg:top-6"
          >
            <Grupo titulo="Espécie">
              <div className="flex flex-wrap gap-2">
                <Chip type="radio" name="especie" value="" defaultChecked={!filtros.especie}>
                  Todas
                </Chip>
                {catalogos.especies.map((e) => (
                  <Chip key={e.slug} type="radio" name="especie" value={e.slug} defaultChecked={filtros.especie === e.slug}>
                    {e.slug === "exoticos" ? "Exóticos" : e.nome}
                  </Chip>
                ))}
              </div>
            </Grupo>

            <Grupo titulo="Serviço" htmlFor="f-servico">
              <Select id="f-servico" name="servico" defaultValue={filtros.servico ?? ""}>
                <option value="">Qualquer serviço</option>
                {catalogos.servicos.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.nome}
                  </option>
                ))}
              </Select>
            </Grupo>

            <Grupo titulo="Modalidade">
              {catalogos.modos.map((m) => (
                <Caixa key={m.slug} name="modo" value={m.slug} rotulo={m.nome} marcado={filtros.modo.includes(m.slug)} />
              ))}
            </Grupo>

            <Grupo titulo="Área de atuação" htmlFor="f-area">
              <Select id="f-area" name="area" defaultValue={filtros.area ?? ""}>
                <option value="">Qualquer área</option>
                {catalogos.areas.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.nome}
                  </option>
                ))}
              </Select>
            </Grupo>

            <Grupo titulo="Disponibilidade">
              {DISPONIBILIDADES.map((d) => (
                <Caixa key={d.slug} name="disp" value={d.slug} rotulo={d.nome} marcado={filtros.disp.includes(d.slug)} />
              ))}
            </Grupo>

            <Grupo titulo="Preço da consulta">
              <div className="flex flex-wrap gap-2">
                <Chip type="radio" name="preco" value="" defaultChecked={!filtros.preco}>
                  Qualquer
                </Chip>
                {PRECOS_MAX.map((p) => (
                  <Chip key={p} type="radio" name="preco" value={String(p)} defaultChecked={filtros.preco === p}>
                    Até R$ {p}
                  </Chip>
                ))}
              </div>
            </Grupo>

            <Grupo titulo="Forma de pagamento">
              {catalogos.pagamentos.map((p) => (
                <Caixa key={p.slug} name="pagamento" value={p.slug} rotulo={p.nome} marcado={filtros.pagamento.includes(p.slug)} />
              ))}
            </Grupo>

            <noscript>
              <Button type="submit" block>
                Aplicar filtros
              </Button>
            </noscript>
          </form>
        </Sheet>

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

const TITULO_GRUPO = "mb-2 block text-small font-semibold text-text";

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

// Linha de checkbox com alvo de toque de 44px (a linha inteira é clicável).
function Caixa({ name, value, rotulo, marcado }: { name: string; value: string; rotulo: string; marcado: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-small text-text">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={marcado}
        className="size-5 rounded-mark border-border-strong accent-primary"
      />
      {rotulo}
    </label>
  );
}
