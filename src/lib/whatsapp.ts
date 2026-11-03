// Número de WhatsApp: leitura, máscara e exibição. Funções puras.

// Aceita "(11) 98765-4321", "11987654321", "+55 11 98765-4321", "011 ...".
// Devolve no formato internacional usado pelo wa.me (55 + DDD + número) ou null.
export function normalizarWhatsApp(valor: string): string | null {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10 && d.length !== 11) return null;
  if (!/^[1-9]{2}/.test(d)) return null; // DDD
  const numero = d.slice(2);
  if (numero.length === 9 && numero[0] !== "9") return null; // celular começa com 9
  if (numero.length === 8 && !/^[2-5]/.test(numero)) return null; // fixo começa com 2 a 5
  return `55${d}`;
}

// "(11) 98765-4321" enquanto a pessoa digita.
export function mascararWhatsApp(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2); // colou com +55
  if (d.startsWith("0")) d = d.slice(1); // 0 + DDD
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// "5511987654321" -> "(11) 98765-4321"
export function formatarTelefone(numero: string) {
  return mascararWhatsApp(numero.replace(/^55/, ""));
}
