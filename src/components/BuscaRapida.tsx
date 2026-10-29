"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Button, Field, Icon, Select } from "@/components/ui";
import type { ItemCatalogo, Regiao } from "@/lib/catalogos";

// Busca do hero da página inicial: local + espécie, levando para /buscar.
// Sem JavaScript o formulário faz um GET normal para /buscar (com campos vazios
// na URL, que o parseFiltros ignora); com JavaScript, só vão os campos escolhidos.
export function BuscaRapida({ regioes, especies }: { regioes: Regiao[]; especies: ItemCatalogo[] }) {
  const router = useRouter();
  const id = useId();
  const grupos = [
    { rotulo: "Alto Tietê", itens: regioes.filter((r) => r.regiao_macro === "alto_tiete") },
    { rotulo: "Zona Leste de São Paulo", itens: regioes.filter((r) => r.regiao_macro === "zona_leste_sp") },
  ];

  return (
    <form
      role="search"
      action="/buscar"
      onSubmit={(e) => {
        e.preventDefault();
        const p = new URLSearchParams();
        for (const [k, v] of new FormData(e.currentTarget)) if (typeof v === "string" && v) p.set(k, v);
        const qs = p.toString();
        router.push(qs ? `/buscar?${qs}` : "/buscar");
      }}
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <Field id={`${id}-local`} label="Cidade ou subprefeitura">
        <Select id={`${id}-local`} name="local" defaultValue="">
          <option value="">Toda a região</option>
          {grupos.map((g) => (
            <optgroup key={g.rotulo} label={g.rotulo}>
              {g.itens.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Field id={`${id}-especie`} label="Espécie">
        <Select id={`${id}-especie`} name="especie" defaultValue="">
          <option value="">Todas</option>
          {especies.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.nome}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit">
        <Icon icon={Search} />
        Buscar
      </Button>
    </form>
  );
}
