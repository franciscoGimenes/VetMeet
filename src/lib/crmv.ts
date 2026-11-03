// CRMV: leitura do que a pessoa digita e exibição no formato oficial.
// Funções puras (servidor e cliente). Nunca monte o texto do CRMV na tela:
// use formatarCrmv().

export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export type Crmv = { numero: string; uf: string; secundaria: boolean };

// "12345", "12.345", "012345", "12345-S", "12345 s", "12345S".
// Devolve o número só com dígitos (sem zeros à esquerda) e se a inscrição é
// secundária (o "S" depois do número), ou null se não for um número válido.
export function lerNumeroCrmv(valor: string): { numero: string; secundaria: boolean } | null {
  const t = valor.trim().toUpperCase().replace(/[.\s]/g, "");
  const m = /^(\d{1,6})(-?S)?$/.exec(t);
  if (!m || /^0+$/.test(m[1])) return null;
  return { numero: m[1].replace(/^0+/, ""), secundaria: Boolean(m[2]) };
}

// "CRMV-SP nº 12345" · secundária: "CRMV-SP nº 12345-S"
export function formatarCrmv({ numero, uf, secundaria }: Crmv) {
  return `CRMV-${uf} nº ${numero}${secundaria ? "-S" : ""}`;
}
