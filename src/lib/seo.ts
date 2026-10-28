import type { Catalogos } from "@/lib/catalogos";
import { FILTROS_VAZIOS, urlBusca, type Filtros } from "@/lib/filtros";

// "Castração (gato) em Suzano", "Veterinários para gatos em Mogi das Cruzes".
export function tituloBusca(f: Filtros, cat: Catalogos) {
  const nome = (itens: { slug: string; nome: string }[], slug?: string) =>
    itens.find((i) => i.slug === slug)?.nome;
  const servico = nome(cat.servicos, f.servico);
  const especie = nome(cat.especies, f.especie);
  const local = nome(cat.regioes, f.local);

  let titulo = servico ?? "Veterinários";
  if (!servico && especie) titulo += ` para ${f.especie === "exoticos" ? "pets exóticos" : especie.toLowerCase()}`;
  if (local) titulo += ` em ${local}`;
  return titulo;
}

// Só buscas por local e/ou espécie viram páginas indexáveis; o resto (e as
// páginas 2+) fica fora do índice para não gerar milhares de URLs quase iguais.
export function buscaIndexavel(f: Filtros, pagina: number) {
  const outros = f.bairro || f.area || f.servico || f.preco || f.modo.length || f.pagamento.length || f.disp.length;
  return pagina === 1 && !outros;
}

export function canonicalBusca(f: Filtros) {
  return urlBusca({ ...FILTROS_VAZIOS, local: f.local, especie: f.especie });
}
