"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Button, Chip, Disclosure, Icon, OptionRow, Sheet } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { contarFiltrosPainel, urlRede, type FiltrosRede as Filtros } from "@/lib/rede";

const DESKTOP = "(min-width: 1024px)";

function lerFormulario(form: HTMLFormElement, categoria: Filtros["categoria"]): Filtros {
  const d = new FormData(form);
  const um = (k: string) => {
    const v = d.get(k);
    return typeof v === "string" && v ? v : undefined;
  };
  return {
    categoria,
    especie: um("especie"),
    servico: um("servico"),
    local: d.getAll("local").filter((v): v is string => typeof v === "string" && v !== ""),
  };
}

// Espécie, serviço e região do veterinário. Celular: sheet em tela cheia que só
// aplica em "Ver publicações". Desktop: barra lateral que aplica a cada mudança.
// A categoria fica nos chips acima do feed.
export function FiltrosRede({ catalogos, filtros, chave }: { catalogos: Catalogos; filtros: Filtros; chave: string }) {
  const router = useRouter();
  const id = useId();
  const FORM_ID = `${id}-filtros`;
  const formRef = useRef<HTMLFormElement>(null);
  const [aberta, setAberta] = useState(false);
  const [, startTransition] = useTransition();

  // URL mudou (chip, voltar do navegador): os campos voltam ao estado dela.
  useLayoutEffect(() => {
    formRef.current?.reset();
  }, [chave]);

  const ativos = contarFiltrosPainel(filtros);

  function navegar(f: Filtros) {
    setAberta(false);
    startTransition(() => router.push(urlRede(f)));
  }

  const fechar = useCallback(() => {
    setAberta(false);
    formRef.current?.reset();
  }, []);

  function limpar() {
    navegar({ categoria: filtros.categoria, local: [] });
  }

  const grupos = [
    { titulo: "Alto Tietê", itens: catalogos.regioes.filter((r) => r.regiao_macro === "alto_tiete") },
    { titulo: "Zona Leste de São Paulo", itens: catalogos.regioes.filter((r) => r.regiao_macro === "zona_leste_sp") },
  ];
  const nome = (itens: { slug: string; nome: string }[], slug?: string) => itens.find((i) => i.slug === slug)?.nome;

  return (
    <>
      <Button variant="secondary" onClick={() => setAberta(true)} className="lg:hidden" aria-haspopup="dialog">
        <Icon icon={SlidersHorizontal} />
        {ativos > 0 ? `Filtros (${ativos})` : "Filtros"}
      </Button>
      <Sheet
        open={aberta}
        onClose={fechar}
        title="Filtros"
        estaticoNoDesktop
        telaCheia
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={limpar}>
              Limpar
            </Button>
            <Button type="submit" form={FORM_ID} size="lg" className="flex-1">
              Ver publicações
            </Button>
          </>
        }
      >
        <form
          id={FORM_ID}
          ref={formRef}
          aria-label="Filtros da Rede"
          onSubmit={(e) => {
            e.preventDefault();
            navegar(lerFormulario(e.currentTarget, filtros.categoria));
          }}
          onChange={(e) => {
            if (window.matchMedia(DESKTOP).matches) navegar(lerFormulario(e.currentTarget, filtros.categoria));
          }}
        >
          <h2 className="hidden pb-2 text-h3 text-text lg:block">Filtros</h2>
          <Disclosure title="Região do veterinário" summary={filtros.local.length ? `${filtros.local.length} selecionadas` : "Toda a região"} defaultOpen>
            <div className="space-y-4">
              {grupos.map((g) => (
                <fieldset key={g.titulo}>
                  <legend className="mb-2 text-small font-medium text-text-muted">{g.titulo}</legend>
                  <div className="space-y-2">
                    {g.itens.map((r) => (
                      <OptionRow key={r.slug} name="local" value={r.slug} defaultChecked={filtros.local.includes(r.slug)}>
                        {r.nome}
                      </OptionRow>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </Disclosure>
          <Disclosure title="Espécie" summary={nome(catalogos.especies, filtros.especie) ?? "Todas"} defaultOpen>
            <div className="flex flex-wrap gap-2">
              <Chip type="radio" name="especie" value="" defaultChecked={!filtros.especie}>
                Todas
              </Chip>
              {catalogos.especies.map((e) => (
                <Chip key={e.slug} type="radio" name="especie" value={e.slug} defaultChecked={filtros.especie === e.slug}>
                  {e.nome}
                </Chip>
              ))}
            </div>
          </Disclosure>
          <Disclosure title="Serviço" summary={nome(catalogos.servicos, filtros.servico) ?? "Todos"} defaultOpen={Boolean(filtros.servico)}>
            <div className="flex flex-wrap gap-2">
              <Chip type="radio" name="servico" value="" defaultChecked={!filtros.servico}>
                Todos
              </Chip>
              {catalogos.servicos.map((s) => (
                <Chip key={s.slug} type="radio" name="servico" value={s.slug} defaultChecked={filtros.servico === s.slug}>
                  {s.nome}
                </Chip>
              ))}
            </div>
          </Disclosure>
          {ativos > 0 && (
            <Button variant="ghost" onClick={limpar} className="mt-2 hidden lg:inline-flex">
              Limpar filtros
            </Button>
          )}
        </form>
      </Sheet>
    </>
  );
}
