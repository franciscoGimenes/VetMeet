import type { Metadata } from "next";
import Link from "next/link";
import { TextoLegal, type SecaoLegal } from "@/components/TextoLegal";
import { CONTATO_EMAIL } from "@/lib/site";
import { TERMOS_VERSAO } from "@/lib/termos";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras de uso do VetMeet para tutores e veterinários.",
  alternates: { canonical: "/termos" },
};

const link = "font-medium text-primary underline underline-offset-4";
const contato = CONTATO_EMAIL ? `pelo e-mail ${CONTATO_EMAIL}` : "pelos canais de contato do site";

const SECOES: SecaoLegal[] = [
  {
    titulo: "O que é o VetMeet",
    paragrafos: [
      "O VetMeet é uma vitrine on-line que ajuda tutores de animais a encontrar médicos-veterinários no Alto Tietê e na Zona Leste de São Paulo. O tutor busca, vê o perfil e fala com o profissional direto, pelo WhatsApp.",
      "O VetMeet não presta serviço veterinário, não agenda consultas, não intermedeia pagamentos e não participa da relação entre tutor e veterinário. Preço, forma de atendimento, diagnóstico e tratamento são combinados e de responsabilidade exclusiva do profissional.",
    ],
  },
  {
    titulo: "Quem pode usar",
    paragrafos: [
      "Qualquer pessoa pode buscar e ver perfis, sem cadastro.",
      "Só médicos-veterinários com inscrição ativa no Conselho Regional de Medicina Veterinária (CRMV) podem criar conta e ter perfil. Não existe conta de tutor. Cada pessoa pode ter uma conta e um perfil.",
    ],
  },
  {
    titulo: "Conta do veterinário",
    paragrafos: [
      "A conta é criada com e-mail e senha ou com o login do LinkedIn. Você é responsável por manter sua senha em sigilo e por tudo o que for feito com a sua conta.",
      "Ao criar a conta, você declara que as informações são verdadeiras e que possui inscrição ativa no CRMV. Informar CRMV de outra pessoa, inexistente, cancelado ou suspenso leva à remoção imediata do perfil, sem prejuízo das medidas legais cabíveis.",
    ],
  },
  {
    titulo: "Verificação do CRMV",
    paragrafos: [
      "Durante a fase de testes e homologação da plataforma, o VetMeet não confere o CRMV informado. Por isso, todo perfil exibe o selo “CRMV não verificado”. O tutor pode conferir a inscrição no site do CRMV do estado.",
      "Quando a verificação for ativada, os perfis conferidos passarão a exibir o selo “CRMV verificado”, e poderemos pedir documentos para confirmar a inscrição.",
    ],
  },
  {
    titulo: "Conteúdo do perfil",
    paragrafos: [
      "Você é responsável por tudo o que publica no seu perfil: nome, foto, apresentação, serviços, preços, locais e formas de contato. As informações devem ser verdadeiras, atualizadas e de acordo com o Código de Ética do Médico-Veterinário e as normas de publicidade do Conselho Federal de Medicina Veterinária (CFMV).",
      "É proibido: prometer cura ou resultado, usar linguagem sensacionalista, expor tutores ou animais sem autorização, publicar conteúdo ofensivo, discriminatório ou ilegal, oferecer serviços fora da sua habilitação e usar o perfil para outra finalidade que não a divulgação do seu trabalho veterinário.",
      "Ao publicar, você autoriza o VetMeet a exibir esse conteúdo no site, na busca e em links de compartilhamento, enquanto o perfil estiver ativo.",
    ],
  },
  {
    titulo: "Pausar, editar e excluir",
    paragrafos: [
      "Na área logada você edita o perfil a qualquer momento, pausa (o perfil sai da busca sem ser apagado) e exclui a conta. A exclusão apaga a conta e os dados do perfil e não pode ser desfeita.",
    ],
  },
  {
    titulo: "Denúncias e remoção de perfis",
    paragrafos: [
      "Qualquer pessoa pode denunciar um perfil pelo botão “Denunciar perfil”. A equipe do VetMeet analisa as denúncias e pode tirar do ar, sem aviso prévio, perfis que descumpram estes Termos, a lei ou as normas do CFMV.",
    ],
  },
  {
    titulo: "Perfis de demonstração",
    paragrafos: [
      "Alguns perfis são fictícios e servem só para mostrar como o VetMeet funciona. Eles têm o selo “Perfil de demonstração” e não abrem conversa no WhatsApp.",
    ],
  },
  {
    titulo: "Limites de responsabilidade",
    paragrafos: [
      "O VetMeet não garante a qualidade, a disponibilidade ou o resultado dos atendimentos, nem a exatidão das informações publicadas pelos profissionais. Em caso de emergência com seu animal, procure atendimento imediatamente.",
      "O site pode ficar fora do ar para manutenção ou por falhas técnicas. Faremos o possível para reduzir essas interrupções.",
    ],
  },
  {
    titulo: "Privacidade",
    paragrafos: [
      <>
        O tratamento de dados pessoais segue a{" "}
        <Link href="/privacidade" className={link}>
          Política de Privacidade
        </Link>
        .
      </>,
    ],
  },
  {
    titulo: "Mudanças nestes Termos",
    paragrafos: [
      "Podemos atualizar estes Termos. Quando a mudança for relevante, pediremos que você aceite a nova versão ao entrar na sua conta.",
    ],
  },
  {
    titulo: "Contato e foro",
    paragrafos: [
      `Dúvidas sobre estes Termos podem ser enviadas ${contato}.`,
      "Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca do domicílio do usuário para resolver eventuais conflitos.",
    ],
  },
];

export default function Termos() {
  return (
    <TextoLegal
      titulo="Termos de Uso"
      versao={TERMOS_VERSAO}
      intro="Estes Termos explicam como o VetMeet funciona e as regras para usar o site. Ao criar uma conta, o veterinário declara que leu e aceita estes Termos."
      secoes={SECOES}
    />
  );
}
