const moeda = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  });

export function faixaPreco(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min == null || max == null || min === max) return moeda((min ?? max)!);
  return `${moeda(min)} a ${moeda(max)}`;
}

export function iniciais(nome: string) {
  const partes = nome.replace(/^Dra?\.\s+/i, "").split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.at(-1)?.[0] ?? "")).toUpperCase();
}

export function listaNatural(itens: string[]) {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}
