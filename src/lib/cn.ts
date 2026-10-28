// Junta classes ignorando valores falsos. Sem merge de conflitos: componentes
// expõem props (variant, size) em vez de aceitar classes que sobrescrevem as suas.
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
