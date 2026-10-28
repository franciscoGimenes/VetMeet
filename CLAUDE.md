# VetMeet — Contexto do Projeto

## Visão
VetMeet é uma plataforma que conecta tutores de animais a médicos-veterinários, com foco nos profissionais autônomos (a maioria do mercado). Hoje o tutor encontra veterinário por buscas genéricas no Google, e profissionais iniciantes, sem verba ou conhecimento de tráfego pago, ficam invisíveis. O VetMeet funciona como uma vitrine/portfólio pesquisável desses profissionais.

Referência de produto: PsyMeet (terapia online), adaptado à veterinária, onde atendimento presencial, domiciliar e portfólio pesam muito mais.

## Fase atual: MVP de validação
Objetivo: colocar na mão de usuários reais para validar a ideia. Escopo enxuto, mas banco de dados estruturado e pronto para uso profissional.

Região inicial: **Alto Tietê + Zona Leste de São Paulo**.

### Dentro do escopo do MVP
- Busca pública de veterinários com filtros
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
