import { BadgeCheck, Bird, Cat, Dog, House, MessageCircle, Rabbit, Scissors, Search, Siren, Syringe, Tractor, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BuscaRapida } from "@/components/BuscaRapida";
import { ButtonLink, Card, cardClasses, chipClasses, Disclosure, Icon } from "@/components/ui";
import { getCatalogos, type Regiao } from "@/lib/catalogos";
import { cn } from "@/lib/cn";
import { FILTROS_VAZIOS, urlBusca, type Filtros } from "@/lib/filtros";
import { PUBLICAR_PRE_CADASTRO_DIRETO } from "@/lib/mvp";
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
    resposta: PUBLICAR_PRE_CADASTRO_DIRETO
      ? "Toque em “Sou veterinário” e preencha nome, CRMV, WhatsApp, cidade, espécies que atende e forma de atendimento. Seu perfil entra na busca na hora."
      : "Toque em “Sou veterinário” e preencha nome, CRMV, WhatsApp, cidade, espécies que atende e forma de atendimento. Você entra na lista de espera e avisamos quando seu perfil puder ir ao ar.",
  },
  {
    pergunta: "Os profissionais são verificados?",
    resposta:
      "Ainda não. A verificação do CRMV está em implementação. Por enquanto, o número mostrado no perfil é informado pelo próprio profissional, e você pode conferi-lo no site do CRMV-SP. Quando a verificação estiver pronta, os perfis conferidos vão exibir o selo “CRMV verificado”.",
  },
];

export default async function Inicio() {
  const catalogos = await getCatalogos();
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
      {/* 1. Hero */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pt-8 pb-6 sm:px-6 md:pt-12 md:pb-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <h1 className="text-display text-balance text-text">Encontre o veterinário certo, perto de você</h1>
          <p className="mt-4 text-body-lg text-pretty text-text-muted">
            Clínicas, atendimento em casa e teleorientação no Alto Tietê e na Zona Leste de São Paulo.
          </p>
          <Card padding="md" className="mt-6">
            <BuscaRapida regioes={catalogos.regioes} especies={catalogos.especies} />
          </Card>
        </div>
        <Image
          src={fotoHero}
          alt="Yorkshire de pelo dourado, de língua de fora, sobre a mesa de atendimento enquanto mãos de luva ouvem o coração dele com um estetoscópio."
          preload
          placeholder="blur"
          sizes="(min-width: 1152px) 528px, (min-width: 1024px) 45vw, (min-width: 640px) 592px, 100vw"
          className="aspect-4/3 w-full rounded-card object-cover"
        />
      </section>

      {/* 2. Espécies */}
      <Secao titulo="Para qual animal?">
        {/* "Grandes animais" ocupa duas colunas: os três links cabem numa linha. */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ESPECIES.map((a) => (
            <li key={a.titulo} className={cn(a.opcoes && "col-span-2")}>
              <CardAtalho atalho={a} />
            </li>
          ))}
        </ul>
      </Secao>

      {/* 3. Como funciona */}
      <Secao titulo="Como funciona">
        <ol className="grid gap-4 md:grid-cols-3">
          {PASSOS.map((p, i) => (
            <Card as="li" key={p.titulo} className="flex flex-col">
              <div className="flex h-28 items-end justify-center md:h-36">
                <Image src={p.imagem} alt={p.alt} className="max-h-full w-auto" />
              </div>
              <p className="mt-5 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-small font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-h3 text-text">{p.titulo}</span>
              </p>
              <p className="mt-2 text-body text-pretty text-text-muted">{p.texto}</p>
            </Card>
          ))}
        </ol>
      </Secao>

      {/* 4. Serviços */}
      <Secao titulo="Serviços mais procurados">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SERVICOS.map((a) => (
            <li key={a.titulo}>
              <CardAtalho atalho={a} />
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

      {/* 6. Faixa para veterinários */}
      <section className="mt-6 bg-accent md:mt-8">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_18rem] md:items-center md:py-12 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="text-h1 text-balance text-text">É veterinário? Seja encontrado por quem está procurando</h2>
            <ul className="mt-6 space-y-3">
              {[
                { icone: Search, texto: "Apareça na busca da sua região sem pagar anúncio nem entender de tráfego pago" },
                { icone: MessageCircle, texto: "Receba o contato direto no seu WhatsApp, sem intermediário" },
                {
                  icone: BadgeCheck,
                  texto: PUBLICAR_PRE_CADASTRO_DIRETO
                    ? "Cadastro em poucos minutos, com o perfil no ar na hora"
                    : "Cadastro em poucos minutos: avisamos quando seu perfil for ao ar",
                },
              ].map((b) => (
                <li key={b.texto} className="flex gap-3 text-body text-text">
                  <Icon icon={b.icone} className="mt-0.5" />
                  {b.texto}
                </li>
              ))}
            </ul>
            <ButtonLink href="/sou-veterinario" variant="secondary" size="lg" className="mt-8 w-full sm:w-auto">
              {PUBLICAR_PRE_CADASTRO_DIRETO ? "Criar meu perfil" : "Entrar na lista de espera"}
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

      {/* 7. Perguntas frequentes */}
      <Secao titulo="Perguntas frequentes" estreita>
        <Card padding="none" className="px-4 py-1 sm:px-5">
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

function Secao({ titulo, estreita, children }: { titulo: string; estreita?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn("mx-auto px-4 py-6 sm:px-6 md:py-8", estreita ? "max-w-3xl" : "max-w-6xl")}>
      <h2 className="mb-4 text-h2 text-text md:mb-6">{titulo}</h2>
      {children}
    </section>
  );
}

function CardAtalho({ atalho: a }: { atalho: Atalho }) {
  const cabecalho = (
    <>
      <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary">
        <Icon icon={a.icone} size="lg" />
      </span>
      <span className="text-body font-semibold text-text">{a.titulo}</span>
    </>
  );

  if (a.href) {
    return (
      <Link
        href={a.href}
        className={cn(cardClasses({ padding: "md" }), "flex h-full flex-col justify-center gap-3 transition-colors hover:border-primary")}
      >
        {cabecalho}
      </Link>
    );
  }

  return (
    <div className={cn(cardClasses({ padding: "md" }), "flex h-full flex-col gap-3")}>
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
            <Link href={busca({ local: r.slug })} className={chipClasses()}>
              {r.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
