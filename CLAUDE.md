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
- `contact_events`: registro de cliques de contato (id, veterinarian_id, canal, filtros_usados jsonb, created_at). Sem dados pessoais do tutor.
- `vet_waitlist`: pré-cadastro de veterinários reais (nome, crmv, whatsapp, email, cidade, especies, consentimento_lgpd, created_at)

Use RLS no Supabase: leitura pública só de veterinários `status = 'ativo'`; inserção pública apenas em `contact_events` e `vet_waitlist`; nada mais é gravável sem autenticação.

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
