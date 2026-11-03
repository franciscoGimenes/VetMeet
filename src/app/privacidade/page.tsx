import type { Metadata } from "next";
import { TextoLegal, type SecaoLegal } from "@/components/TextoLegal";
import { CONTATO_EMAIL } from "@/lib/site";
import { PRIVACIDADE_VERSAO } from "@/lib/termos";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o VetMeet trata dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

const contato = CONTATO_EMAIL ? `pelo e-mail ${CONTATO_EMAIL}` : "pelos canais de contato do site";

const SECOES: SecaoLegal[] = [
  {
    titulo: "Quem trata os dados",
    paragrafos: [
      `O VetMeet é o controlador dos dados pessoais tratados no site, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD). Pedidos e dúvidas sobre privacidade podem ser enviados ${contato}.`,
    ],
  },
  {
    titulo: "Tutores e visitantes",
    paragrafos: [
      "Para buscar e ver perfis, não é preciso cadastro, e não coletamos nome, telefone, e-mail ou outros dados pessoais de tutores.",
      "Registramos de forma anônima as buscas feitas (filtros usados e quantidade de resultados) e os cliques nos botões de contato (qual perfil e qual canal), sem identificar quem buscou ou clicou. Esses registros servem para medir o uso do site e melhorar a busca.",
      "A conversa pelo WhatsApp acontece direto entre você e o veterinário. O VetMeet não vê nem guarda essas mensagens.",
      "Se você enviar uma denúncia, guardamos o motivo, a descrição que você escrever e um código gerado a partir do seu endereço IP (o IP em si não é guardado), usado só para limitar envios em excesso.",
    ],
  },
  {
    titulo: "Veterinários",
    paragrafos: [
      "Conta: e-mail e senha (guardada de forma criptografada pelo nosso provedor de autenticação) ou, no login com LinkedIn, nome, e-mail e foto informados pelo LinkedIn. Também registramos a data e a versão dos Termos e desta Política que você aceitou e a sua declaração sobre o CRMV.",
      "Perfil público: nome, CRMV, foto, WhatsApp, Instagram, apresentação, anos de experiência, locais de atendimento, cidades atendidas, espécies, áreas, serviços, preços e formas de pagamento. Esses dados são publicados por você, para que tutores encontrem e contatem você. O e-mail da conta não aparece no site.",
      "Usamos esses dados para manter sua conta e seu perfil, mostrar seu perfil na busca, enviar e-mails sobre a conta (confirmação, recuperação de senha e avisos importantes) e analisar denúncias.",
    ],
  },
  {
    titulo: "Bases legais",
    paragrafos: [
      "Tratamos os dados do veterinário para executar o serviço que ele contratou ao criar a conta (art. 7º, V, da LGPD) e com base no seu consentimento para a publicação do perfil (art. 7º, I). Registros anônimos de uso e de segurança se apoiam no legítimo interesse do VetMeet em manter o site funcionando e protegido (art. 7º, IX).",
    ],
  },
  {
    titulo: "Com quem compartilhamos",
    paragrafos: [
      "Não vendemos dados pessoais. Usamos fornecedores que tratam dados em nosso nome, só para operar o site: Supabase (banco de dados, autenticação e armazenamento de fotos), Vercel (hospedagem), Resend (envio de e-mails) e LinkedIn (apenas para quem escolhe entrar com LinkedIn).",
      "Alguns desses fornecedores guardam dados fora do Brasil. Nesses casos, a transferência segue o que a LGPD exige, com fornecedores que adotam medidas de segurança e proteção de dados.",
    ],
  },
  {
    titulo: "Cookies",
    paragrafos: [
      "Usamos apenas cookies necessários para manter o veterinário conectado à própria conta. Não usamos cookies de publicidade nem de rastreamento entre sites.",
    ],
  },
  {
    titulo: "Por quanto tempo guardamos",
    paragrafos: [
      "Os dados da conta e do perfil ficam guardados enquanto a conta existir. Ao excluir a conta, apagamos a conta, o perfil, a foto, os aceites e o pré-cadastro com o mesmo e-mail. Os registros anônimos de busca e de contato permanecem, sem o nome do profissional.",
      "Podemos manter dados por mais tempo quando a lei exigir ou para exercer direitos em processos.",
    ],
  },
  {
    titulo: "Seus direitos",
    paragrafos: [
      "Você pode, a qualquer momento, confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir a exclusão, revogar o consentimento e pedir informações sobre com quem compartilhamos (art. 18 da LGPD).",
      `Veterinários fazem a maior parte disso direto na área logada: editar o perfil, pausar e excluir a conta. Para os demais pedidos, escreva ${contato}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
    ],
  },
  {
    titulo: "Segurança",
    paragrafos: [
      "Adotamos medidas técnicas para proteger os dados, como conexão criptografada, controle de acesso por usuário no banco de dados, senhas criptografadas e remoção dos metadados (como localização) das fotos enviadas.",
    ],
  },
  {
    titulo: "Mudanças nesta Política",
    paragrafos: [
      "Podemos atualizar esta Política. Quando a mudança for relevante, pediremos que o veterinário aceite a nova versão ao entrar na conta.",
    ],
  },
];

export default function Privacidade() {
  return (
    <TextoLegal
      titulo="Política de Privacidade"
      versao={PRIVACIDADE_VERSAO}
      intro="Esta Política explica quais dados pessoais o VetMeet trata, para quê e quais são os seus direitos."
      secoes={SECOES}
    />
  );
}
