// Montagem dos links de contato. Funções puras (servidor e cliente).

const FRASE_SERVICO: Record<string, string> = {
  consulta: "uma consulta",
  vacinacao: "vacinação",
  "castracao-cao": "castração",
  "castracao-gato": "castração",
  "aplicacao-medicacao": "aplicação de medicação",
  "coleta-exames": "coleta de exames",
  curativos: "curativos e retirada de pontos",
  microchipagem: "microchipagem",
  "atestado-viagem": "atestado de saúde para viagem",
  ultrassonografia: "ultrassonografia",
  eutanasia: "eutanásia",
};

const FRASE_ESPECIE: Record<string, string> = {
  caes: "meu cão",
  gatos: "meu gato",
  aves: "minha ave",
  exoticos: "meu pet exótico",
  equinos: "meu cavalo",
  ruminantes: "meus animais",
  suinos: "meus suínos",
};

// Ex.: "Olá, Dra. Fulana! Encontrei seu perfil no VetMeet e gostaria de
// informações sobre castração para meu gato em Suzano."
export function mensagemWhatsApp(ctx: {
  nome: string;
  servico?: string;
  especie?: string;
  local?: string;
}) {
  const especie =
    ctx.especie ??
    (ctx.servico === "castracao-gato" ? "gatos" : ctx.servico === "castracao-cao" ? "caes" : undefined);

  if (!ctx.servico && !especie && !ctx.local) {
    return `Olá, ${ctx.nome}! Encontrei seu perfil no VetMeet e gostaria de mais informações.`;
  }

  let pedido = `informações sobre ${ctx.servico ? FRASE_SERVICO[ctx.servico] : "atendimento"}`;
  if (especie) pedido += ` para ${FRASE_ESPECIE[especie]}`;
  if (ctx.local) pedido += ` em ${ctx.local}`;
  return `Olá, ${ctx.nome}! Encontrei seu perfil no VetMeet e gostaria de ${pedido}.`;
}

export function linkWhatsApp(numero: string, mensagem: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
}

export function linkMaps(local: {
  lat: number | null;
  lng: number | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string;
}) {
  const query =
    local.lat != null && local.lng != null
      ? `${local.lat},${local.lng}`
      : [local.endereco, local.bairro, local.cidade, "SP"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function linkInstagram(usuario: string) {
  return `https://instagram.com/${usuario.replace(/^@/, "")}`;
}

export type CanalContato = "whatsapp" | "instagram" | "maps";
export type OrigemContato = "card" | "perfil";

export type EventoContato = {
  veterinarian_id: string;
  canal: CanalContato;
  origem: OrigemContato;
  filtros: Record<string, unknown>;
};
