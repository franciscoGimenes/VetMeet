import { BadgeCheck, Bird, Cat, Dog, House, MessageCircle, Rabbit, Scissors, Search, Siren, Syringe, Tractor, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BuscaRapida } from "@/components/BuscaRapida";
import { Forma } from "@/components/decor/Forma";
import { PreviaPost } from "@/components/rede/PreviaPost";
import { ButtonLink, Card, chipClasses, Disclosure, Icon } from "@/components/ui";
import { getCatalogos, type Regiao } from "@/lib/catalogos";
import { cn } from "@/lib/cn";
import { FILTROS_VAZIOS, urlBusca, type Filtros } from "@/lib/filtros";
import { postsRecentes } from "@/lib/posts";
import fotoHero from "../../public/images/home/exame-yorkshire.jpg";
import fotoVeterinario from "../../public/images/home/ultrassom-spitz.jpg";
import ilustracaoGato from "../../public/illustrations/undraw_cat_lqdj.svg";
import ilustracaoCao from "../../public/illustrations/undraw_dog_jfxm.svg";
import ilustracaoTutora from "../../public/illustrations/undraw_good-doggy_4ast.svg";
import ilustracaoPasseio from "../../public/illustrations/undraw_walking-the-dog_cjob.svg";

const TITULO = "VetMeet: encontre veterinário no Alto Tietê e na Zona Leste";
const DESCRICAO =
  "Compare veterinários com clínica própria, atendimento em casa ou teleorientação em Mogi, Suzano, Itaquera e região. Veja preços e fale direto pelo WhatsApp.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: "/" },
  openGraph: { title: TITULO, description: DESCRICAO, url: "/" },
};

const busca = (f: Partial<Filtros>) => urlBusca({ ...FILTROS_VAZIOS, ...f });

// Atalho com um destino só (card inteiro clicável) ou com várias opções
// (a busca aceita uma espécie/serviço por vez, então "grandes animais" e
// "castração" se abrem em links menores).
type Atalho = { titulo: string; icone: LucideIcon } & (
  | { href: string; opcoes?: never }
  | { href?: never; opcoes: { rotulo: string; href: string }[] }
);

const ESPECIES: Atalho[] = [
  { titulo: "Cães", icone: Dog, href: busca({ especie: "caes" }) },
  { titulo: "Gatos", icone: Cat, href: busca({ especie: "gatos" }) },
  { titulo: "Aves", icone: Bird, href: busca({ especie: "aves" }) },
  { titulo: "Exóticos", icone: Rabbit, href: busca({ especie: "exoticos" }) },
  {
    titulo: "Grandes animais",
    icone: Tractor,
    opcoes: [
      { rotulo: "Equinos", href: busca({ especie: "equinos" }) },
      { rotulo: "Ruminantes", href: busca({ especie: "ruminantes" }) },
      { rotulo: "Suínos", href: busca({ especie: "suinos" }) },
    ],
  },
];

const SERVICOS: Atalho[] = [
  {
    titulo: "Castração",
    icone: Scissors,
    opcoes: [
      { rotulo: "Cão", href: busca({ servico: "castracao-cao" }) },
      { rotulo: "Gato", href: busca({ servico: "castracao-gato" }) },
    ],
  },
  { titulo: "Vacinação", icone: Syringe, href: busca({ servico: "vacinacao" }) },
  { titulo: "Atendimento em casa", icone: House, href: busca({ modo: ["domiciliar"] }) },
  { titulo: "Emergência", icone: Siren, href: busca({ disp: ["emergencia"] }) },
];

const PASSOS = [
  {
    titulo: "Busque",
    texto: "Filtre por cidade, espécie, serviço e forma de atendimento.",
    imagem: ilustracaoCao,
    alt: "Ilustração de um cachorro sentado, de lenço verde no pescoço, olhando para cima com curiosidade.",
  },
  {
    titulo: "Compare perfis",
    texto: "Veja áreas de atuação, preços e onde cada profissional atende.",
    imagem: ilustracaoGato,
    alt: "Ilustração de um gato sentado, tranquilo, com coleira verde.",
  },
  {
    titulo: "Chame no WhatsApp",
    texto: "Fale direto com o veterinário, sem intermediário.",
    imagem: ilustracaoTutora,
    alt: "Ilustração de uma tutora fazendo carinho na cabeça de um cachorro grande sentado ao seu lado.",
  },
];

const PERGUNTAS = [
  {
    pergunta: "Como funciona o VetMeet?",
    resposta:
      "Você busca veterinários por cidade, espécie, serviço e forma de atendimento, compara os perfis e fala direto com o profissional pelo WhatsApp. Consulta, horário e pagamento são combinados entre vocês. Nesta fase de testes, parte dos perfis é de demonstração e aparece com o selo “Perfil de demonstração”.",
  },
  {
    pergunta: "Preciso pagar para usar?",
    resposta:
      "Não. Buscar, ver perfis e entrar em contato é gratuito e não exige cadastro. O valor da consulta você combina direto com o veterinário; o VetMeet não cobra nada do tutor.",
  },
  {
    pergunta: "Como entro em contato com o veterinário?",
    resposta:
      "Pelo botão de WhatsApp no card ou no perfil do profissional. A conversa abre direto com ele, no seu WhatsApp: o VetMeet não vê nem guarda suas mensagens.",
  },
  {
    pergunta: "Sou veterinário. Como me cadastro?",
    resposta:
      "Toque em “Sou veterinário”, crie sua conta com e-mail ou LinkedIn e preencha seu perfil: CRMV, WhatsApp, onde e como atende, espécies, serviços e preços. Ao publicar, ele entra na busca na hora, e você pode editar, pausar ou excluir quando quiser.",
  },
  {
    pergunta: "Os profissionais são verificados?",
    resposta:
      "Ainda não. Nesta fase de testes, o CRMV mostrado no perfil é informado pelo próprio profissional, que declara ter inscrição ativa, e o perfil exibe o selo “CRMV não verificado”. Você pode conferir o número no site do CRMV do estado. Se algo parecer errado, use “Denunciar perfil”, no fim da página do profissional.",
  },
];

export default async function Inicio() {
  const [catalogos, recentes] = await Promise.all([getCatalogos(), postsRecentes(3)]);
  const alto = catalogos.regioes.filter((r) => r.regiao_macro === "alto_tiete");
  const leste = catalogos.regioes.filter((r) => r.regiao_macro === "zona_leste_sp");

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PERGUNTAS.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  };

  return (
    <>
      {/* 1. Hero: o ponto memorável da página (forma orgânica atrás da foto, patinhas) */}
      <section className="relative overflow-hidden bg-sage-100 bg-patinhas">
        {/* Só no desktop: no celular aparecia cortada ao lado da foto e pesava o topo */}
        <Forma variante="c" className="-bottom-40 -left-40 hidden h-110 w-120 text-accent-soft md:block" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <h1 className="text-display text-balance text-text">Encontre o veterinário certo, perto de você</h1>
            <p className="mt-4 text-body-lg text-pretty text-text-muted">
              Clínicas, atendimento em casa e teleorientação no Alto Tietê e na Zona Leste de São Paulo.
            </p>
            <Card padding="md" className="mt-6">
              <BuscaRapida regioes={catalogos.regioes} especies={catalogos.especies} />
            </Card>
          </div>
          <div className="relative">
            {/* sage-200: primary-soft some sobre sage-100 (os dois tons quase se confundem) */}
            <Forma variante="a" className="-inset-6 text-sage-200 md:-inset-10" />
            <Image
              src={fotoHero}
              alt="Yorkshire de pelo dourado, de língua de fora, sobre a mesa de atendimento enquanto mãos de luva ouvem o coração dele com um estetoscópio."
              preload
              placeholder="blur"
              sizes="(min-width: 1152px) 528px, (min-width: 1024px) 45vw, (min-width: 640px) 592px, 100vw"
              className="relative aspect-4/3 w-full rounded-card object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Espécies: cada bloco com o seu tom */}
      <Secao titulo="Para qual animal?" fundo="bg-surface">
        {/* "Grandes animais" ocupa duas colunas: os três links cabem numa linha. */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ESPECIES.map((a, i) => (
            <li key={a.titulo} className={cn(a.opcoes && "col-span-2")}>
              <CardAtalho atalho={a} tom={TONS_ESPECIE[i % TONS_ESPECIE.length]} />
            </li>
          ))}
        </ul>
      </Secao>

      {/* 3. Como funciona: é uma sequência de verdade, por isso numerada; sem caixas */}
      <Secao titulo="Como funciona">
        <ol className="grid gap-6 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            // Celular: ilustração ao lado do texto (empilhadas, as três dobravam a seção)
            <li key={p.titulo} className="grid grid-cols-[6rem_1fr] items-center gap-4 md:flex md:flex-col md:items-stretch md:gap-0">
              <div className="flex h-24 items-end justify-center md:h-36">
                <Image src={p.imagem} alt={p.alt} className="max-h-full w-auto" />
              </div>
              <div>
                <p className="flex items-center gap-3 md:mt-5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary text-small font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-h3 text-text">{p.titulo}</span>
                </p>
                <p className="mt-2 text-body text-pretty text-text-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </Secao>

      {/* 4. Serviços */}
      <Secao titulo="Serviços mais procurados" fundo="bg-surface">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SERVICOS.map((a) => (
            <li key={a.titulo}>
              <CardAtalho atalho={a} tom={TOM_SERVICO} />
            </li>
          ))}
        </ul>
      </Secao>

      {/* 5. Cidades */}
      <Secao titulo="Cidades atendidas">
        <div className="grid gap-8 lg:grid-cols-[1fr_16rem] lg:items-center">
          <div className="space-y-6">
            <ListaCidades titulo="Alto Tietê" regioes={alto} />
            <ListaCidades titulo="Zona Leste de São Paulo" regioes={leste} />
          </div>
          <Image
            src={ilustracaoPasseio}
            alt="Ilustração de uma tutora passeando com o cachorro na coleira, ao lado de uma árvore."
            className="hidden h-auto w-full lg:block"
          />
        </div>
      </Secao>

      {/* 6. Rede: o que os veterinários estão publicando */}
      {recentes.length > 0 && (
        <Secao titulo="Na Rede dos veterinários" fundo="bg-surface">
          <p className="-mt-2 mb-6 max-w-2xl text-body text-text-muted md:-mt-4">
            Dicas para tutores, relatos de caso e bastidores, escritos por quem atende na sua região.
          </p>
          <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
            {recentes.map((p) => (
              <li key={p.id}>
                <PreviaPost post={p} />
              </li>
            ))}
          </ul>
          <ButtonLink href="/rede" variant="secondary" size="lg" className="mt-6 w-full sm:w-auto md:mt-8">
            Ver a Rede
          </ButtonLink>
        </Secao>
      )}

      {/* 7. Faixa para veterinários: o único accent desta área é o botão */}
      <section className="tema-escuro bg-primary-dark bg-patinhas-claras">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_18rem] md:items-center md:py-16 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="text-h1 text-balance text-background">É veterinário? Seja encontrado por quem está procurando</h2>
            <ul className="mt-6 space-y-3">
              {[
                { icone: Search, texto: "Apareça na busca da sua região sem pagar anúncio nem entender de tráfego pago" },
                { icone: MessageCircle, texto: "Receba o contato direto no seu WhatsApp, sem intermediário" },
                {
                  icone: BadgeCheck,
                  texto: "Cadastro em poucos minutos, com o perfil no ar na hora",
                },
              ].map((b) => (
                <li key={b.texto} className="flex items-start gap-3 text-body text-sage-200">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary">
                    <Icon icon={b.icone} size="sm" />
                  </span>
                  <span className="pt-1">{b.texto}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/sou-veterinario" variant="accent" size="lg" className="mt-8 w-full sm:w-auto">
              Criar meu perfil
            </ButtonLink>
          </div>
          <Image
            src={fotoVeterinario}
            alt="Veterinário de pijama cirúrgico azul e estetoscópio no pescoço opera um aparelho de ultrassom, ao lado de um spitz alemão laranja deitado na mesa."
            placeholder="blur"
            sizes="(min-width: 1024px) 352px, 288px"
            className="hidden aspect-4/5 w-full rounded-card object-cover md:block"
          />
        </div>
      </section>

      {/* 8. Perguntas frequentes */}
      <Secao titulo="Perguntas frequentes" estreita fundo="bg-caramel-100">
        <Card padding="none" className="px-4 py-1 sm:px-6">
          {PERGUNTAS.map((p) => (
            <Disclosure key={p.pergunta} title={p.pergunta}>
              <p className="text-body text-pretty text-text-muted">{p.resposta}</p>
            </Disclosure>
          ))}
        </Card>
      </Secao>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq).replace(/</g, "\\u003c") }} />
    </>
  );
}

// Cada seção ocupa a largura toda com o seu fundo; o conteúdo fica centralizado.
function Secao({
  titulo,
  estreita,
  fundo = "bg-background",
  children,
}: {
  titulo: string;
  estreita?: boolean;
  fundo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={fundo}>
      <div className={cn("mx-auto px-4 py-10 sm:px-6 md:py-16", estreita ? "max-w-3xl" : "max-w-6xl")}>
        <h2 className="mb-4 text-h2 text-text md:mb-6">{titulo}</h2>
        {children}
      </div>
    </section>
  );
}

// Bloco colorido: sem borda nem sombra (o tom já separa); círculo do ícone num tom mais forte.
type Tom = { bloco: string; circulo: string };
const TONS_ESPECIE: Tom[] = [
  { bloco: "bg-sage-100", circulo: "bg-sage-200 text-primary" },
  { bloco: "bg-caramel-100", circulo: "bg-caramel-200 text-accent-strong" },
  { bloco: "bg-sky-100", circulo: "bg-surface text-info-strong" },
];
const TOM_SERVICO: Tom = { bloco: "bg-background", circulo: "bg-accent-soft text-accent-strong" };

function CardAtalho({ atalho: a, tom }: { atalho: Atalho; tom: Tom }) {
  const bloco = cn("flex h-full flex-col gap-3 rounded-card p-4", tom.bloco);
  const cabecalho = (
    <>
      <span className={cn("flex size-12 items-center justify-center rounded-pill", tom.circulo)}>
        <Icon icon={a.icone} size="lg" />
      </span>
      <span className="text-body font-semibold text-text">{a.titulo}</span>
    </>
  );

  if (a.href) {
    return (
      <Link href={a.href} className={cn(bloco, "justify-center transition-shadow hover:ring-2 hover:ring-primary")}>
        {cabecalho}
      </Link>
    );
  }

  return (
    <div className={bloco}>
      {cabecalho}
      <ul className="flex flex-wrap gap-2">
        {a.opcoes!.map((o) => (
          <li key={o.rotulo}>
            <Link href={o.href} aria-label={`${a.titulo}: ${o.rotulo}`} className={chipClasses()}>
              {o.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListaCidades({ titulo, regioes }: { titulo: string; regioes: Regiao[] }) {
  return (
    <div>
      <h3 className="text-h3 text-text">{titulo}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {regioes.map((r) => (
          <li key={r.slug}>
            <Link href={busca({ local: [r.slug] })} className={chipClasses()}>
              {r.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
