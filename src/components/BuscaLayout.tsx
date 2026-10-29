"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Button, Chip, Disclosure, Icon, Input, OptionRow, Sheet } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { DISPONIBILIDADES, NOME_MAX, normalizarNome, PRECOS_MAX, type Filtros } from "@/lib/filtros";

const DESKTOP = "(min-width: 1024px)";
const ESPERA_DIGITACAO_MS = 400;
const ESPERA_CONTAGEM_MS = 250;
const NOME_MIN = 2;

// Estado dos filtros enquanto a pessoa escolhe (no celular só vale ao tocar em
// "Ver resultados"). Bairros vêm como "cidade.bairro".
type Rascunho = {
  local: string[];
  bairro: string[];
  especie: string;
  servico: string;
  area: string;
  preco: string;
  modo: string[];
  disp: string[];
  pagamento: string[];
};

function rascunhoDe(f: Filtros): Rascunho {
  return {
    local: f.local,
    bairro: f.bairro,
    especie: f.especie ?? "",
    servico: f.servico ?? "",
    area: f.area ?? "",
    preco: f.preco ? String(f.preco) : "",
    modo: f.modo,
    disp: f.disp,
    pagamento: f.pagamento,
  };
}

function lerRascunho(form: HTMLFormElement): Rascunho {
  const d = new FormData(form);
  const um = (k: string) => {
    const v = d.get(k);
    return typeof v === "string" ? v : "";
  };
  const varios = (k: string) => d.getAll(k).filter((v): v is string => typeof v === "string" && v !== "");
  return {
    local: varios("local"),
    bairro: varios("bairro"),
    especie: um("especie"),
    servico: um("servico"),
    area: um("area"),
    preco: um("preco"),
    modo: varios("modo"),
    disp: varios("disp"),
    pagamento: varios("pagamento"),
  };
}

function paramsDe(r: Rascunho, q: string | undefined) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  for (const k of ["local", "bairro"] as const) r[k].forEach((v) => p.append(k, v));
  for (const k of ["especie", "servico", "area", "preco"] as const) if (r[k]) p.set(k, r[k]);
  for (const k of ["modo", "disp", "pagamento"] as const) r[k].forEach((v) => p.append(k, v));
  return p;
}

// Bairro marcado leva a cidade junto; cidade desmarcada leva os bairros dela.
function sincronizarLocais(form: HTMLFormElement, alvo: HTMLInputElement) {
  const caixas = (name: string) =>
    Array.from(form.elements).filter(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.name === name,
    );
  if (alvo.name === "bairro" && alvo.checked) {
    const cidade = caixas("local").find((c) => c.value === alvo.value.split(".")[0]);
    if (cidade) cidade.checked = true;
  }
  if (alvo.name === "local" && !alvo.checked) {
    for (const b of caixas("bairro")) if (b.value.startsWith(`${alvo.value}.`)) b.checked = false;
  }
}

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// `chave` é a query string atual. Quando muda, os campos de filtro voltam ao
// estado da URL (form.reset) sem remontar nada: as seções que a pessoa abriu
// continuam abertas e o campo de nome não perde foco nem texto.
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
  // escondida (<Activity>), e ids fixos apontariam para os elementos dela.
  const id = useId();
  const FORM_ID = `${id}-filtros`;
  const ID_NOME = `${id}-nome`;

  const formRef = useRef<HTMLFormElement>(null);
  const [pendente, startTransition] = useTransition();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [termo, setTermo] = useState(filtros.q ?? "");
  // O último nome que este componente mandou para a URL.
  const [qEnviado, setQEnviado] = useState(filtros.q);
  const [rascunho, setRascunho] = useState(() => rascunhoDe(filtros));
  const [buscaLocal, setBuscaLocal] = useState("");
  const [total, setTotal] = useState<number | null>(null);

  // URL mudou: o rascunho volta a ser a URL. O nome só é sobrescrito se a
  // mudança veio de fora (chip removido, link, voltar do navegador).
  const [chaveAnterior, setChaveAnterior] = useState(chave);
  if (chave !== chaveAnterior) {
    setChaveAnterior(chave);
    setRascunho(rascunhoDe(filtros));
    setBuscaLocal("");
    if (filtros.q !== qEnviado) {
      setTermo(filtros.q ?? "");
      setQEnviado(filtros.q);
    }
  }
  // ...e os inputs não controlados (chips, linhas) voltam ao defaultChecked da URL.
  useLayoutEffect(() => {
    formRef.current?.reset();
  }, [chave]);

  const ativos =
    (filtros.local.length ? 1 : 0) +
    [filtros.especie, filtros.servico, filtros.area, filtros.preco].filter(Boolean).length +
    filtros.modo.length +
    filtros.disp.length +
    filtros.pagamento.length;

  // substituir: troca a entrada do histórico em vez de criar outra (digitação).
  function navegar(params: URLSearchParams, substituir = false) {
    setQEnviado(params.get("q") ?? undefined);
    setGavetaAberta(false);
    const url = params.size ? `/buscar?${params}` : "/buscar";
    startTransition(() => (substituir ? router.replace(url) : router.push(url)));
  }

  function aplicar(substituir = false) {
    const r = formRef.current ? lerRascunho(formRef.current) : rascunho;
    navegar(paramsDe(r, normalizarNome(termo)), substituir);
  }

  // Contagem ao vivo para o botão "Ver X resultados" do celular.
  const contagem = useRef<AbortController | null>(null);
  const esperaContagem = useRef<ReturnType<typeof setTimeout>>(undefined);
  function contar(r: Rascunho) {
    contagem.current?.abort();
    const controle = new AbortController();
    contagem.current = controle;
    fetch(`/api/contagem?${paramsDe(r, normalizarNome(termo))}`, { signal: controle.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((d: { total: number }) => setTotal(d.total))
      .catch(() => {});
  }

  function aoMudarFiltro(e: React.FormEvent<HTMLFormElement>) {
    // Campos sem name (busca dentro da lista de lugares) não são filtro.
    const alvo = e.target as HTMLInputElement;
    if (!alvo.name || !formRef.current) return;
    sincronizarLocais(formRef.current, alvo);
    const r = lerRascunho(formRef.current);
    setRascunho(r);
    if (window.matchMedia(DESKTOP).matches) {
      navegar(paramsDe(r, normalizarNome(termo)));
      return;
    }
    clearTimeout(esperaContagem.current);
    esperaContagem.current = setTimeout(() => contar(r), ESPERA_CONTAGEM_MS);
  }

  function abrirGaveta() {
    setTotal(null);
    setGavetaAberta(true);
    contar(rascunho);
  }

  // Fechar sem aplicar descarta o que foi mexido.
  const fecharGaveta = useCallback(() => {
    setGavetaAberta(false);
    formRef.current?.reset();
    setRascunho(rascunhoDe(filtros));
    setBuscaLocal("");
  }, [filtros]);

  // "Limpar" no celular: zera as escolhas do rascunho (o nome continua).
  function limparRascunho() {
    const form = formRef.current;
    if (!form) return;
    for (const el of Array.from(form.elements)) {
      if (!(el instanceof HTMLInputElement) || !el.name) continue;
      if (el.type === "checkbox") el.checked = false;
      if (el.type === "radio") el.checked = el.value === "";
    }
    const r = lerRascunho(form);
    setRascunho(r);
    setBuscaLocal("");
    contar(r);
  }

  // Debounce do nome: só busca depois de uma pausa na digitação, e só com 2+
  // letras (ou vazio, para limpar). Enter busca na hora.
  const buscarNome = useEffectEvent(() => aplicar(true));
  useEffect(() => {
    const q = normalizarNome(termo);
    if (q === qEnviado || (q && q.length < NOME_MIN)) return;
    const espera = setTimeout(buscarNome, ESPERA_DIGITACAO_MS);
    return () => clearTimeout(espera);
  }, [termo, qEnviado]);

  const nomeDe = (itens: { slug: string; nome: string }[], slug: string) => itens.find((i) => i.slug === slug)?.nome;
  const resumoVarios = (itens: { slug: string; nome: string }[], slugs: string[], vazio: string) =>
    slugs.length === 0 ? vazio : slugs.length === 1 ? nomeDe(itens, slugs[0]) : `${slugs.length} selecionadas`;
  const resumoLocal =
    rascunho.local.length === 0
      ? "Toda a região"
      : rascunho.local.length === 1
        ? (nomeDe(catalogos.regioes, rascunho.local[0]) ?? "")
        : `${rascunho.local.length} selecionadas`;
  const rotuloBotao =
    total === null
      ? "Ver resultados"
      : total === 0
        ? "Nenhum resultado"
        : total === 1
          ? "Ver 1 resultado"
          : `Ver ${total} resultados`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* Nome + botão de filtros: fixos no topo ao rolar (no celular) */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:rounded-card lg:border lg:bg-surface lg:p-4 lg:shadow-card">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            aplicar();
          }}
          className="flex items-end gap-2"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor={ID_NOME} className="mb-1 flex items-center gap-1.5 text-caption font-medium text-text-muted">
              <Icon icon={Search} size="sm" /> Nome do veterinário ou clínica
            </label>
            <div className="relative">
              <Input
                id={ID_NOME}
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
          <Button variant="secondary" onClick={abrirGaveta} className="lg:hidden" aria-haspopup="dialog">
            <Icon icon={SlidersHorizontal} />
            {ativos > 0 ? `Filtros (${ativos})` : "Filtros"}
          </Button>
        </form>
      </div>

      <div className="mt-4 lg:mt-0 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
        {/* Filtros: sheet em tela cheia no celular, barra lateral no desktop */}
        <Sheet
          open={gavetaAberta}
          onClose={fecharGaveta}
          title="Filtros"
          estaticoNoDesktop
          telaCheia
          footer={
            <>
              <Button variant="secondary" size="lg" onClick={limparRascunho}>
                Limpar
              </Button>
              <Button type="submit" form={FORM_ID} size="lg" className="flex-1" aria-live="polite">
                {rotuloBotao}
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
              aplicar();
            }}
            onChange={aoMudarFiltro}
            className="lg:sticky lg:top-6"
          >
            {/* Sem JS o nome segue junto com os filtros */}
            {filtros.q && <input type="hidden" name="q" value={filtros.q} />}

            <Disclosure
              title="Localização"
              summary={resumoLocal}
              defaultOpen
            >
              <ListaLocais
                catalogos={catalogos}
                selecionados={rascunho.local}
                iniciais={filtros}
                busca={buscaLocal}
                onBusca={setBuscaLocal}
              />
            </Disclosure>

            <Disclosure title="Espécie" summary={nomeDe(catalogos.especies, rascunho.especie) ?? "Todas"} defaultOpen>
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
            </Disclosure>

            <Disclosure title="Serviço" summary={nomeDe(catalogos.servicos, rascunho.servico) ?? "Qualquer"} defaultOpen>
              <div className="flex flex-wrap gap-2">
                <Chip type="radio" name="servico" value="" defaultChecked={!filtros.servico}>
                  Qualquer
                </Chip>
                {catalogos.servicos.map((s) => (
                  <Chip key={s.slug} type="radio" name="servico" value={s.slug} defaultChecked={filtros.servico === s.slug}>
                    {s.nome}
                  </Chip>
                ))}
              </div>
            </Disclosure>

            <Disclosure
              title="Modalidade"
              summary={resumoVarios(catalogos.modos, rascunho.modo, "Todas")}
              defaultOpen={filtros.modo.length > 0}
            >
              <div className="space-y-2">
                {catalogos.modos.map((m) => (
                  <OptionRow
                    key={m.slug}
                    name="modo"
                    value={m.slug}
                    defaultChecked={filtros.modo.includes(m.slug)}
                    hint={DESCRICAO_MODO[m.slug]}
                  >
                    {m.nome}
                  </OptionRow>
                ))}
              </div>
            </Disclosure>

            <Disclosure
              title="Área de atuação"
              summary={nomeDe(catalogos.areas, rascunho.area) ?? "Qualquer"}
              defaultOpen={Boolean(filtros.area)}
            >
              <div className="flex flex-wrap gap-2">
                <Chip type="radio" name="area" value="" defaultChecked={!filtros.area}>
                  Qualquer
                </Chip>
                {catalogos.areas.map((a) => (
                  <Chip key={a.slug} type="radio" name="area" value={a.slug} defaultChecked={filtros.area === a.slug}>
                    {a.nome}
                  </Chip>
                ))}
              </div>
            </Disclosure>

            <Disclosure
              title="Disponibilidade"
              summary={resumoVarios([...DISPONIBILIDADES], rascunho.disp, "Qualquer")}
              defaultOpen={filtros.disp.length > 0}
            >
              <div className="flex flex-wrap gap-2">
                {DISPONIBILIDADES.map((d) => (
                  <Chip key={d.slug} name="disp" value={d.slug} defaultChecked={filtros.disp.includes(d.slug)}>
                    {d.nome}
                  </Chip>
                ))}
              </div>
            </Disclosure>

            <Disclosure
              title="Preço da consulta"
              summary={rascunho.preco ? `Até R$ ${rascunho.preco}` : "Qualquer"}
              defaultOpen={Boolean(filtros.preco)}
            >
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
            </Disclosure>

            <Disclosure
              title="Forma de pagamento"
              summary={resumoVarios(catalogos.pagamentos, rascunho.pagamento, "Qualquer")}
              defaultOpen={filtros.pagamento.length > 0}
            >
              <div className="flex flex-wrap gap-2">
                {catalogos.pagamentos.map((p) => (
                  <Chip key={p.slug} name="pagamento" value={p.slug} defaultChecked={filtros.pagamento.includes(p.slug)}>
                    {p.nome}
                  </Chip>
                ))}
              </div>
            </Disclosure>

            <noscript>
              <Button type="submit" block className="mt-4">
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

const DESCRICAO_MODO: Record<string, string> = {
  clinica_propria: "Consultório ou clínica do profissional",
  domiciliar: "O profissional vai até a sua casa",
  teleorientacao: "Orientação por videochamada",
};

// Lista de lugares com busca. Todas as linhas ficam no DOM (escondidas quando
// não batem com a busca) para a escolha feita continuar valendo no formulário.
function ListaLocais({
  catalogos,
  selecionados,
  iniciais,
  busca,
  onBusca,
}: {
  catalogos: Catalogos;
  selecionados: string[];
  iniciais: Filtros;
  busca: string;
  onBusca: (texto: string) => void;
}) {
  const termo = semAcento(busca.trim());
  const bate = (nome: string) => !termo || semAcento(nome).includes(termo);
  const macros = [
    { chave: "alto_tiete", nome: "Alto Tietê" },
    { chave: "zona_leste_sp", nome: "Zona Leste de São Paulo" },
  ] as const;

  const grupos = macros.map((m) => {
    const regioes = catalogos.regioes
      .filter((r) => r.regiao_macro === m.chave)
      .map((r) => {
        const bairros = catalogos.bairros
          .filter((b) => b.region_id === r.id && b.nome !== r.nome)
          .map((b) => ({
            ...b,
            // Bairros aparecem quando a cidade está escolhida ou quando a busca acha o bairro.
            visivel: termo ? bate(b.nome) : selecionados.includes(r.slug),
          }));
        const visivel = bate(r.nome) || (Boolean(termo) && bairros.some((b) => b.visivel));
        return { ...r, bairros, visivel };
      });
    return { ...m, regioes, visivel: regioes.some((r) => r.visivel) };
  });
  const nenhum = Boolean(termo) && grupos.every((g) => !g.visivel);

  return (
    <div>
      <Input
        type="search"
        aria-label="Buscar cidade, subprefeitura ou bairro"
        placeholder="Buscar cidade ou bairro"
        autoComplete="off"
        value={busca}
        onChange={(e) => onBusca(e.target.value)}
        className="mb-3"
      />
      <div className="max-h-72 space-y-2 overflow-y-auto overscroll-contain rounded-control border border-border p-2">
        {grupos.map((g) => (
          <div key={g.chave} className="space-y-2" hidden={!g.visivel}>
            <p className="pt-2 text-caption font-semibold text-text-muted">{g.nome}</p>
            {g.regioes.map((r) => (
              <div key={r.slug} className="space-y-2" hidden={!r.visivel}>
                <OptionRow name="local" value={r.slug} defaultChecked={iniciais.local.includes(r.slug)}>
                  {r.nome}
                </OptionRow>
                {r.bairros.map((b) => (
                  <OptionRow
                    key={b.slug}
                    name="bairro"
                    value={`${r.slug}.${b.slug}`}
                    defaultChecked={iniciais.bairro.includes(`${r.slug}.${b.slug}`)}
                    hidden={!b.visivel}
                    hint={termo ? r.nome : undefined}
                    indent
                  >
                    {b.nome}
                  </OptionRow>
                ))}
              </div>
            ))}
          </div>
        ))}
        {nenhum && <p className="py-2 text-small text-text-muted">Nenhum lugar com “{busca.trim()}”.</p>}
      </div>
    </div>
  );
}
