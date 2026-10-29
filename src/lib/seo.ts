import type { Catalogos } from "@/lib/catalogos";
import { FILTROS_VAZIOS, urlBusca, type Filtros } from "@/lib/filtros";
import { listaNatural } from "@/lib/formato";

// "Castração (gato) em Suzano", "Veterinários para gatos em Mogi das Cruzes".
export function tituloBusca(f: Filtros, cat: Catalogos) {
  const nome = (itens: { slug: string; nome: string }[], slug?: string) =>
    itens.find((i) => i.slug === slug)?.nome;
  const servico = nome(cat.servicos, f.servico);
  const especie = nome(cat.especies, f.especie);
  const locais = f.local.map((l) => nome(cat.regioes, l)).filter((n): n is string => Boolean(n));
  const local = locais.length > 3 ? `${locais.length} cidades` : locais.length ? listaNatural(locais) : undefined;

  if (f.q) return `“${f.q}”${local ? ` em ${local}` : ""}: veterinários e clínicas`;

  let titulo = servico ?? "Veterinários";
  if (!servico && especie) titulo += ` para ${f.especie === "exoticos" ? "pets exóticos" : especie.toLowerCase()}`;
  if (local) titulo += ` em ${local}`;
  return titulo;
}

// Só buscas por uma cidade e/ou espécie viram páginas indexáveis; o resto (várias
// cidades, bairros, outros filtros, páginas 2+) fica fora do índice para não
// gerar milhares de URLs quase iguais.
export function buscaIndexavel(f: Filtros, pagina: number) {
  const outros = f.q || f.local.length > 1 || f.bairro.length || f.area || f.servico || f.preco || f.modo.length || f.pagamento.length || f.disp.length;
  return pagina === 1 && !outros;
}

export function canonicalBusca(f: Filtros) {
  return urlBusca({ ...FILTROS_VAZIOS, local: f.local.slice(0, 1), especie: f.especie });
}
