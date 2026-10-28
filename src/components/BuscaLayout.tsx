"use client";

import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { Button, Chip, Icon, Input, Select, Sheet } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { DISPONIBILIDADES, NOME_MAX, normalizarNome, PRECOS_MAX, type Filtros } from "@/lib/filtros";

const DESKTOP = "(min-width: 1024px)";
const ESPERA_DIGITACAO_MS = 400;
const NOME_MIN = 2;

// `chave` é a query string atual: o formulário de filtros é recriado quando ela
// muda, para voltar a refletir a URL. O campo de nome fica de fora (não pode
// perder foco nem texto enquanto a pessoa digita).
export function BuscaLayout({
  catalogos,
  filtros,
  chave = "",
  children,
}: {
  catalogos: Catalogos;
  filtros: Filtros;
  chave?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  // Ids únicos por instância: com Cache Components, a página anterior fica no DOM
  // escondida (<Activity>), e ids fixos fariam form="..." apontar para o
  // formulário escondido.
  const id = useId();
  const FORM_ID = `${id}-form`;
  const ID_NOME = `${id}-nome`;
  const naBusca = usePathname() === "/buscar";
  const formRef = useRef<HTMLFormElement>(null);
  const [pendente, startTransition] = useTransition();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [regiao, setRegiao] = useState(filtros.local ?? "");
  const [termo, setTermo] = useState(filtros.q ?? "");
  // O último nome que este componente mandou para a URL.
  const [qEnviado, setQEnviado] = useState(filtros.q);

  // URL mudou por fora (chip removido, link, voltar do navegador): sincroniza os
  // campos controlados. Se a mudança foi o próprio nome digitado aqui, não mexe
  // no texto, que pode já estar à frente do que foi enviado.
  const [chaveAnterior, setChaveAnterior] = useState(chave);
  if (chave !== chaveAnterior) {
    setChaveAnterior(chave);
    setRegiao(filtros.local ?? "");
    if (filtros.q !== qEnviado) {
      setTermo(filtros.q ?? "");
      setQEnviado(filtros.q);
    }
  }

  const regiaoAtual = catalogos.regioes.find((r) => r.slug === regiao);
  const bairros = regiaoAtual ? catalogos.bairros.filter((b) => b.region_id === regiaoAtual.id) : [];
  const qtdFiltros =
    [filtros.especie, filtros.servico, filtros.area, filtros.preco].filter(Boolean).length +
    filtros.modo.length +
    filtros.disp.length +
    filtros.pagamento.length;

  // substituir: troca a entrada do histórico em vez de criar outra (digitação).
  function enviar({ semBairro = false, substituir = false } = {}) {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    for (const [chave, valor] of new FormData(form)) {
      if (typeof valor !== "string" || !valor) continue;
      if (semBairro && chave === "bairro") continue;
      if (chave === "q") {
        const q = normalizarNome(valor);
        if (q) params.set("q", q);
        continue;
      }
      params.append(chave, valor);
    }
    setQEnviado(params.get("q") ?? undefined);
    setGavetaAberta(false);
    const url = params.size ? `/buscar?${params}` : "/buscar";
    startTransition(() => (substituir ? router.replace(url) : router.push(url)));
  }

  // Debounce do nome: só busca depois de uma pausa na digitação, e só com 2+
  // letras (ou vazio, para limpar). Enter busca na hora. Fora de /buscar (página
  // inicial) só o Enter busca: navegar no meio da digitação trocaria de página e
  // a pessoa perderia o foco e o que digitou depois da pausa.
  const buscarNome = useEffectEvent(() => enviar({ substituir: true }));
  useEffect(() => {
    const q = normalizarNome(termo);
    if (!naBusca || q === qEnviado || (q && q.length < NOME_MIN)) return;
    const espera = setTimeout(buscarNome, ESPERA_DIGITACAO_MS);
    return () => clearTimeout(espera);
  }, [termo, qEnviado, naBusca]);

  const fecharGaveta = useCallback(() => setGavetaAberta(false), []);
  const noDesktop = () => window.matchMedia(DESKTOP).matches;

  const macros = [
    { chave: "alto_tiete", nome: "Alto Tietê" },
    { chave: "zona_leste_sp", nome: "Zona Leste de São Paulo" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* Nome e localização: sempre visíveis, acima dos resultados */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:rounded-card lg:border lg:bg-surface lg:p-4 lg:shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor={ID_NOME} className="mb-1 flex items-center gap-1.5 text-caption font-medium text-text-muted">
              <Icon icon={Search} size="sm" /> Nome do veterinário ou clínica
            </label>
            <div className="relative">
              <Input
                id={ID_NOME}
                name="q"
                form={FORM_ID}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                maxLength={NOME_MAX}
                placeholder="Ex.: Ana, Hospital Lacerda"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="pr-12 [&::-webkit-search-cancel-button]:hidden"
              />
              {termo && (
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label="Limpar nome"
                  onClick={() => setTermo("")}
                  className="absolute top-0 right-0"
                >
                  <Icon icon={X} />
                </Button>
              )}
            </div>
          </div>
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
                key={`${regiao}|${chave}`}
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
                  // Limpa os filtros da gaveta; nome e cidade continuam.
                  const manter = new URLSearchParams();
                  if (filtros.q) manter.set("q", filtros.q);
                  if (regiao) manter.set("local", regiao);
                  startTransition(() => router.push(manter.size ? `/buscar?${manter}` : "/buscar"));
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
            key={chave}
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

            <Grupo titulo="Serviço" htmlFor={`${id}-servico`}>
              <Select id={`${id}-servico`} name="servico" defaultValue={filtros.servico ?? ""}>
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

            <Grupo titulo="Área de atuação" htmlFor={`${id}-area`}>
              <Select id={`${id}-area`} name="area" defaultValue={filtros.area ?? ""}>
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
