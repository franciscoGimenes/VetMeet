# VetMeet — Contexto do Projeto

## Visão
VetMeet é uma plataforma que conecta tutores de animais a médicos-veterinários, com foco nos profissionais autônomos (a maioria do mercado). Hoje o tutor encontra veterinário por buscas genéricas no Google, e profissionais iniciantes, sem verba ou conhecimento de tráfego pago, ficam invisíveis. O VetMeet funciona como uma vitrine/portfólio pesquisável desses profissionais.

Referência de produto: PsyMeet (terapia online), adaptado à veterinária, onde atendimento presencial, domiciliar e portfólio pesam muito mais.

## Fase atual: MVP de validação
Objetivo: colocar na mão de usuários reais para validar a ideia. Escopo enxuto, mas banco de dados estruturado e pronto para uso profissional.

Região inicial: **Alto Tietê + Zona Leste de São Paulo**.

### Dentro do escopo do MVP
- Tela inicial (landing)
- Busca pública de veterinários com filtros
- Busca por nome
- Página de perfil do veterinário
- Contato via WhatsApp (link wa.me) com registro do clique
- Formulário de pré-cadastro para veterinários reais (lista de espera)
- Dados de demonstração realistas, marcados como demo

### Fora do escopo (NÃO implementar agora)
- Agendamento e pagamento dentro da plataforma
- Avaliações/reviews de usuários
- Login de tutor
- Aba "Rede" (LinkedIn nichado de veterinários): fase futura. Modele o banco de forma que não atrapalhe essa expansão, mas não construa nada dela.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) com migrations SQL versionadas em `supabase/migrations`
- Seed em `supabase/seed.sql` (ou script TS equivalente)
- Deploy alvo: Vercel

## Design system

Tokens definidos no Tailwind (`src/app/globals.css`, blocos `@theme` e `@utility`).
Nos componentes: nunca hex, px, font-size ou font-weight avulsos; só tokens.
Componentes base em `src/components/ui`; as telas usam esses componentes em vez de
reestilizar elementos soltos.

### Cores
| Token | Valor | Uso |
|---|---|---|
| primary | #1F6F5C | ações principais, links, foco (verde sálvia: saúde, confiança) |
| primary-hover | #185A4B | hover/pressionado de primary |
| primary-soft | #E3F1EC | fundos de destaque, chip selecionado |
| accent | #E08A3C | fundos e destaques com texto escuro por cima (caramelo: acolhimento, pets) |
| accent-strong | #A45926 | texto e ícone em tom caramelo |
| accent-soft | #FBEEDF | fundo do selo de demonstração e destaques suaves |
| background | #FAF8F4 | fundo da página (off-white quente) |
| surface | #FFFFFF | cards, campos, sheets |
| text | #1E2A27 | texto principal |
| text-muted | #5F6F6A | texto secundário |
| border | #E4E0D8 | divisórias e contorno de cards |
| border-strong | #918E89 | contorno de inputs, selects e checkboxes (3:1) |
| success / success-strong | #2F9E6B / #268057 | base: fundo, ícone, borda · strong: texto |
| warning / warning-strong | #D9A23B / #906C27 | idem |
| error / error-strong | #C8553D / #BC5039 | idem |
| info / info-strong | #3A7CA5 / #3878A0 | idem |
| whatsapp / whatsapp-hover | #15803D / #166534 | só o botão de WhatsApp |
| chart | #16846A | marcas de gráfico com uma série (mesmo matiz de primary, com saturação suficiente: validado com a skill dataviz) |

Regras:
- `accent` nunca é cor de texto sobre fundo claro (2,67:1). Texto sobre `accent` é sempre `text`.
- Status: a cor base nunca é texto; texto usa `*-strong`. Status sempre com ícone + rótulo,
  nunca só cor.
- Selo "Perfil de demonstração": fundo `accent-soft`, texto `accent-strong`.
- Classes do Tailwind: `text-text`, `text-text-muted`, `bg-background`, `bg-surface`,
  `border-border` etc.

Contraste validado (WCAG AA, texto ≥ 4,5:1; contornos de controle ≥ 3:1):
text sobre background 13,98 · surface 14,83 · primary-soft 12,76 · accent-soft 13,00 · accent 5,56 |
text-muted sobre background 4,99 · surface 5,29 · primary-soft 4,55 · accent-soft 4,64 |
branco sobre primary 6,02 · primary-hover 8,07 · whatsapp 5,02 |
primary sobre surface 6,02 · background 5,68 · primary-soft 5,18 |
accent-strong sobre accent-soft 4,56 · surface 5,20 · background 4,91 |
*-strong sobre surface ≥ 4,8 e sobre background ≥ 4,5 | border-strong sobre surface 3,26.
Reprovados (não usar): accent como texto (2,67), branco sobre accent (2,67), cores base de
status como texto, border como contorno de campo (1,32).

### Tipografia
Fontes via `next/font` (sem link externo):
- Títulos: Plus Jakarta Sans 600 e 700
- Texto e interface: Inter 400, 500 e 600

Escala (cada token já define família, peso, tamanho e entrelinha):
| Token | Mobile | Desktop (≥ 768px) | Fonte e peso |
|---|---|---|---|
| display | 36/44 | 48/56 | Jakarta 700 |
| h1 | 28/36 | 36/44 | Jakarta 700 |
| h2 | 22/30 | 28/36 | Jakarta 600 |
| h3 | 18/26 | 18/26 | Jakarta 600 |
| body-lg | 18/28 | 18/28 | Inter 400 |
| body | 16/24 | 16/24 | Inter 400 |
| small | 14/20 | 14/20 | Inter 400 |
| caption | 12/16 | 12/16 | Inter 400 |

- Ênfase dentro de body/small/caption: só `font-medium` (500) e `font-semibold` (600).
- Proibido `text-[..]`, `text-sm`/`text-lg` etc. e `font-bold`/`font-[..]` fora destes tokens.
- Campos de formulário usam `body` (16px) no celular, para o iOS não dar zoom ao focar.

### Forma, sombra e espaço
- Raio: `rounded-control` 12px (botões, inputs, selects) · `rounded-card` 16px (cards, sheet,
  dialog) · `rounded-pill` (chips, badges) · `rounded-mark` 4px (só marcas de gráfico).
- Sombra: `shadow-card` (cards em repouso) · `shadow-overlay` (sheet, dialog, tooltip).
- Espaçamento: escala de 4px do Tailwind, sem valores arbitrários. Margem lateral da página
  16px (mobile) / 24px (desktop); padding de card 16px / 24px; espaço entre seções 24px / 32px.

### Toque e acessibilidade
- Todo alvo clicável tem no mínimo 44×44px e fica a pelo menos 8px de outro alvo.
  Exceção: links dentro de texto corrido (permitido pelo WCAG 2.5.8).
- Foco sempre visível: anel de 2px em `primary` com 2px de afastamento (`focus-visible`).
- Nunca remover outline sem pôr o anel no lugar.

### Componentes base (`src/components/ui`)
Button (primary, secondary, ghost, whatsapp; tamanhos md 44px e lg 52px), Chip (selecionável),
OptionRow (linha inteira clicável com checkbox/radio desenhado), Disclosure (seção recolhível),
Input, Select, Card, Badge, Sheet (bottom sheet no celular; `telaCheia` e `estaticoNoDesktop`).
Variações novas entram no componente, não na tela.

### Filtros da busca
- Celular: botão "Filtros (n)" fixo no topo; sheet em tela cheia com cabeçalho e rodapé fixos.
  As escolhas são um rascunho: só valem ao tocar em "Ver X resultados" (contagem ao vivo via
  `/api/contagem`); fechar descarta. Desktop: barra lateral com os mesmos componentes,
  aplicando a cada mudança.
- Seções recolhíveis; Localização, Espécie e Serviço abertas por padrão (e qualquer seção com
  filtro ativo).
- Opções: chips para escolhas curtas, OptionRow para listas com descrição ou hierarquia.
  Nada de checkbox solto, nada de select nativo para listas longas, nada de slider.
- Localização: lista com busca (sem acento), bairros aparecem sob a cidade escolhida ou quando a
  busca os acha. As linhas filtradas ficam no DOM com `hidden` para a escolha não se perder.
- Os campos voltam ao estado da URL com `form.reset()` (não remontar: fecharia as seções
  abertas). Por isso o campo de nome fica fora do formulário de filtros.

### Ícones
Só `lucide-react`, sempre pelo componente `Icon` de `src/components/ui`. Tamanho padrão 20px,
traço 2. Use 16px dentro de texto small/caption e 24px em destaques. Sem SVG desenhado à mão
nos componentes. A lucide 1.x não tem ícones de marca: WhatsApp usa `MessageCircle` e
Instagram usa `AtSign`, sempre com o nome escrito ao lado.

### Arquivos de imagem
Fotos em `public/images/`, ilustrações em `public/illustrations/`.

## Modelo de dados (base)
Tabelas principais (ajuste nomes/tipos se tiver motivo, mas mantenha a normalização):

- `veterinarians`: id, slug, nome_exibicao, crmv_numero, crmv_uf, crmv_verificado (bool), bio, foto_url, whatsapp, instagram, anos_experiencia, consulta_preco_min, consulta_preco_max, atende_emergencia, atende_fim_de_semana, atende_noturno, is_demo (bool, default false), status (rascunho/ativo/inativo), created_at, updated_at
- `regions`: municípios e subprefeituras (id, nome, tipo: municipio | subprefeitura, regiao_macro: alto_tiete | zona_leste_sp)
- `neighborhoods`: bairros (id, region_id, nome)
- `clinics`: locais de atendimento próprios (id, veterinarian_id, nome, endereco, neighborhood_id, lat, lng)
- `species`: espécies atendidas (catálogo)
- `specialties`: áreas de atuação (catálogo)
- `services`: serviços/procedimentos (catálogo)
- `payment_methods`: catálogo
- Tabelas de junção N:N: `veterinarian_species`, `veterinarian_specialties`, `veterinarian_services` (com preco_min/preco_max opcionais por serviço), `veterinarian_payment_methods`, `veterinarian_coverage_regions` (regiões cobertas em atendimento domiciliar)
- `attendance_modes` (catálogo: clinica_propria, domiciliar, teleorientacao) + `veterinarian_attendance_modes`
- `contact_events`: registro de cliques de contato (id, veterinarian_id com `on delete set null`, snapshots vet_slug/vet_is_demo preenchidos por trigger, canal: whatsapp | instagram | maps, origem: card | perfil, filtros_usados jsonb, created_at). Sem dados pessoais do tutor; sobrevive à remoção dos demos.
- `vet_waitlist`: pré-cadastro de veterinários reais (nome, crmv_numero, crmv_uf, whatsapp, email, region_id, especies, modalidades, consentimento_lgpd, created_at)
- `vet_waitlist_tentativas`: hash do IP por envio do pré-cadastro, para o limite de 5/hora (nunca o IP em claro)
- `search_events`: buscas exibidas (filtros jsonb, local, total). Registradas pelo navegador via `/api/busca`, não na renderização do servidor (pré-carregamento de links inflaria os números)
- `admins`: e-mails com acesso ao painel `/admin`

Use RLS no Supabase:
- Leitura pública: catálogos e veterinários `status = 'ativo'` (e seus vínculos).
- Inserção pública (anon): apenas `contact_events`.
- `vet_waitlist`, `vet_waitlist_tentativas` e `search_events` são gravados só pelo servidor com a service role (`src/lib/supabase/admin.ts`), depois de validação, honeypot e limite por IP. Não volte a abrir insert público nelas: isso permitiria contornar essas proteções pela API do Supabase com a chave pública.
- Leitura de `vet_waitlist`, `contact_events` e `search_events`: só usuários logados presentes em `admins` (`public.is_admin()`).
- Funções RPC: prefira `security invoker` (o RLS continua valendo).

## Regra temporária desta versão do MVP
- O formulário "Sou veterinário" **publica o perfil na hora** (status `ativo`, `is_demo = false`, `crmv_verificado = false`), via `public.publicar_pre_cadastro`. O perfil nasce só com o que o formulário coleta (nome, CRMV, WhatsApp, cidade, espécies, modalidades); bio, áreas, serviços e preços ficam vazios.
- Controlado por `PUBLICAR_PRE_CADASTRO_DIRETO` em `src/lib/mvp.ts`. Com `false`, volta a ser só lista de espera, e o texto de consentimento e as telas acompanham.
- **Não vale para as próximas versões:** antes de evoluir o MVP, desligue a flag e substitua por aprovação manual no painel (a mesma função serve para um botão "aprovar").
- Para tirar um perfil do ar: `update veterinarians set status = 'inativo' where slug = '...'` no SQL Editor.

## Painel e autenticação
- `/admin` usa login por link mágico do Supabase. Duas travas: `ADMIN_EMAILS` (env) decide quem recebe o link; a tabela `admins` decide quem lê os dados.
- `src/proxy.ts` (o antigo middleware, renomeado no Next 16) renova a sessão nas rotas `/admin` e `/auth`.
- Não há login de tutor nem de veterinário no MVP.

## Banco e migrations
- Projeto Supabase em nuvem: `vetmeet` (ref `xieishahvlzatkbuppch`). Não há Docker local.
- Quando uma migration for aplicada pelo MCP do Supabase (`apply_migration`), o Supabase registra a versão com o horário da aplicação. Renomeie o arquivo em `supabase/migrations` para essa versão (confira com `list_migrations`), senão `supabase db push` diverge do histórico.
- Deploy e banco de produção: ver `docs/DEPLOY.md`.

## Next.js 16 neste projeto
- `cacheComponents` está ligado: dados compartilhados usam `'use cache'` + `cacheLife`; `searchParams`, `params` e `cookies()` são lidos dentro de `<Suspense>`. Não use `useSearchParams` no cliente; passe os filtros como props.
- Leia `node_modules/next/dist/docs/` antes de usar APIs que possam ter mudado (ver `AGENTS.md`).
- Para testar no celular via IP da rede, `allowedDevOrigins` em `next.config.ts` já libera `192.168.*.*` e `10.*.*.*`.
- Com Cache Components, a página anterior **continua no DOM, escondida** (`<Activity>`, até 3 rotas). Em componentes de cliente, nunca use `id` fixo (nem para `form="..."`, `htmlFor` ou `aria-labelledby`): use `useId()`, senão o atributo aponta para o elemento da página escondida. Em testes, selecione só elementos visíveis.

## Busca por nome
- `?q=` procura no nome do veterinário e no nome das clínicas dele, sem acento e sem maiúsculas, por trecho; cada palavra precisa aparecer em um dos dois.
- No banco: `public.normalizar_texto()` (unaccent com dicionário fixo, imutável) + índices trigrama (`pg_trgm`) nas duas colunas. Extensões ficam no schema `extensions`.
- No campo: debounce de 400ms, mínimo de 2 letras, Enter busca na hora, digitação usa `router.replace` (não enche o histórico). Na página inicial só o Enter busca (navegar no meio da digitação trocaria de página).
- Não tolera erro de digitação ("Kéber" não acha "Kléber"); `pg_trgm` permite adicionar isso depois com `similarity`.

## Filtros da busca
1. **Localização**: município/subprefeitura e bairro. Para atendimento domiciliar, considerar `veterinarian_coverage_regions`.
2. **Espécie**: cães, gatos, aves, pets exóticos (roedores, coelhos, répteis), equinos, ruminantes, suínos.
3. **Modalidade**: clínica própria, domiciliar, teleorientação.
4. **Área de atuação**: clínica geral, medicina felina, dermatologia, cardiologia, ortopedia, oftalmologia, odontologia, oncologia, endocrinologia, neurologia, comportamento, nutrição, fisioterapia/reabilitação, acupuntura, anestesiologia, diagnóstico por imagem, medicina de animais selvagens/exóticos.
5. **Serviço/procedimento**: consulta, vacinação, castração (cão), castração (gato), aplicação de medicação, coleta de exames, curativos/retirada de pontos, microchipagem, atestado de saúde para viagem, ultrassonografia, eutanásia.
6. **Disponibilidade**: emergência, fim de semana, noturno.
7. **Faixa de preço da consulta**.
8. **Forma de pagamento**: Pix, cartão de débito, cartão de crédito, parcelamento, dinheiro.

Filtros devem ser combináveis e refletidos na URL (query string), para que buscas possam ser compartilhadas.

## Regiões
- **Alto Tietê**: Arujá, Biritiba Mirim, Ferraz de Vasconcelos, Guararema, Itaquaquecetuba, Mogi das Cruzes, Poá, Salesópolis, Santa Isabel, Suzano.
- **Zona Leste SP (subprefeituras)**: Penha, Ermelino Matarazzo, São Miguel Paulista, Itaim Paulista, Guaianases, Cidade Tiradentes, Itaquera, São Mateus, Mooca, Aricanduva/Vila Formosa, Vila Prudente, Sapopemba.

## Dados de demonstração
- Todo perfil fake tem `is_demo = true` e exibe na UI o selo "Perfil de demonstração".
- Deve existir um script/SQL simples para remover todos os perfis demo e seus vínculos.
- Os dados precisam parecer de mercado, não mecânicos: nomes brasileiros variados, bios com voz própria, preços quebrados e coerentes com a região (ex.: consulta em clínica entre R$ 130 e R$ 260; domiciliar entre R$ 180 e R$ 380; castração de gata entre R$ 380 e R$ 750; castração de cão variando por porte até ~R$ 1.400). Distribuição desigual entre cidades, como na realidade (Mogi e Suzano com mais oferta, Salesópolis e Biritiba com pouca).
- Números de CRMV fictícios e `crmv_verificado = false` nos demos. Nunca usar dados de pessoas reais.

## Diretrizes
- Interface em português do Brasil, mobile-first (a maioria dos tutores vai acessar pelo celular).
- Visual limpo e profissional, sem textos explicativos poluindo o layout.
- LGPD: não coletar dados pessoais do tutor no MVP; checkbox de consentimento no pré-cadastro de veterinários.
- Commits pequenos e descritivos. Ao terminar cada etapa, liste o que foi feito e como testar.
