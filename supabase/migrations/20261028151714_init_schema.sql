-- VetMeet: schema base do MVP.
-- Tabelas em inglês, colunas em português (convenção do CLAUDE.md).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.vet_status as enum ('rascunho', 'ativo', 'inativo');
create type public.region_tipo as enum ('municipio', 'subprefeitura');
create type public.regiao_macro as enum ('alto_tiete', 'zona_leste_sp');
create type public.contact_canal as enum ('whatsapp', 'instagram', 'maps');
create type public.contact_origem as enum ('card', 'perfil');

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------
create table public.regions (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  tipo public.region_tipo not null,
  regiao_macro public.regiao_macro not null,
  unique (regiao_macro, nome)
);

create table public.neighborhoods (
  id integer generated always as identity primary key,
  region_id smallint not null references public.regions (id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  unique (region_id, slug),
  -- alvo da FK composta em clinics (garante bairro dentro da região)
  unique (id, region_id)
);
create index neighborhoods_region_id_idx on public.neighborhoods (region_id);

create table public.species (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  ordem smallint not null default 0
);

create table public.specialties (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  ordem smallint not null default 0
);

create table public.services (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  ordem smallint not null default 0
);

create table public.attendance_modes (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9_-]+$'),
  nome text not null,
  ordem smallint not null default 0
);

create table public.payment_methods (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  ordem smallint not null default 0
);

-- ---------------------------------------------------------------------------
-- Veterinários
-- ---------------------------------------------------------------------------
create table public.veterinarians (
  id uuid primary key default gen_random_uuid(),
  -- dono do perfil quando houver login de veterinário (fase futura / aba Rede)
  user_id uuid unique references auth.users (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome_exibicao text not null check (length(trim(nome_exibicao)) > 0),
  crmv_numero text not null check (crmv_numero ~ '^[0-9]{1,6}$'),
  crmv_uf char(2) not null check (crmv_uf ~ '^[A-Z]{2}$'),
  crmv_verificado boolean not null default false,
  bio text,
  foto_url text,
  whatsapp text check (whatsapp ~ '^55[0-9]{10,11}$'),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  anos_experiencia smallint check (anos_experiencia between 0 and 70),
  consulta_preco_min numeric(10, 2) check (consulta_preco_min >= 0),
  consulta_preco_max numeric(10, 2) check (consulta_preco_max >= 0),
  atende_emergencia boolean not null default false,
  atende_fim_de_semana boolean not null default false,
  atende_noturno boolean not null default false,
  is_demo boolean not null default false,
  status public.vet_status not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint veterinarians_consulta_preco_ck
    check (consulta_preco_min is null or consulta_preco_max is null
           or consulta_preco_min <= consulta_preco_max)
);

-- CRMV único só entre perfis reais: um CRMV demo nunca bloqueia um cadastro real.
create unique index veterinarians_crmv_real_uq
  on public.veterinarians (crmv_numero, crmv_uf) where is_demo = false;
create index veterinarians_ativo_idx on public.veterinarians (id) where status = 'ativo';
create index veterinarians_preco_idx on public.veterinarians (consulta_preco_min, consulta_preco_max);
create index veterinarians_emergencia_idx on public.veterinarians (id) where atende_emergencia;
create index veterinarians_fim_de_semana_idx on public.veterinarians (id) where atende_fim_de_semana;
create index veterinarians_noturno_idx on public.veterinarians (id) where atende_noturno;
create index veterinarians_is_demo_idx on public.veterinarians (id) where is_demo;

create trigger veterinarians_set_updated_at
  before update on public.veterinarians
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Locais de atendimento
-- ---------------------------------------------------------------------------
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  nome text not null,
  endereco text,
  region_id smallint not null references public.regions (id) on delete restrict,
  neighborhood_id integer,
  lat numeric(9, 6) check (lat between -90 and 90),
  lng numeric(9, 6) check (lng between -180 and 180),
  created_at timestamptz not null default now(),
  constraint clinics_neighborhood_fk
    foreign key (neighborhood_id, region_id)
    references public.neighborhoods (id, region_id) on delete restrict
);
create index clinics_veterinarian_id_idx on public.clinics (veterinarian_id);
create index clinics_region_id_idx on public.clinics (region_id);
create index clinics_neighborhood_id_idx on public.clinics (neighborhood_id);

-- ---------------------------------------------------------------------------
-- Junções N:N
-- ---------------------------------------------------------------------------
create table public.veterinarian_species (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  species_id smallint not null references public.species (id) on delete restrict,
  primary key (veterinarian_id, species_id)
);
create index veterinarian_species_rev_idx on public.veterinarian_species (species_id, veterinarian_id);

create table public.veterinarian_specialties (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  specialty_id smallint not null references public.specialties (id) on delete restrict,
  principal boolean not null default false,
  primary key (veterinarian_id, specialty_id)
);
create index veterinarian_specialties_rev_idx on public.veterinarian_specialties (specialty_id, veterinarian_id);
-- no máximo uma área principal por veterinário
create unique index veterinarian_specialties_principal_uq
  on public.veterinarian_specialties (veterinarian_id) where principal;

create table public.veterinarian_services (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  service_id smallint not null references public.services (id) on delete restrict,
  preco_min numeric(10, 2) check (preco_min >= 0),
  preco_max numeric(10, 2) check (preco_max >= 0),
  primary key (veterinarian_id, service_id),
  constraint veterinarian_services_preco_ck
    check (preco_min is null or preco_max is null or preco_min <= preco_max)
);
create index veterinarian_services_rev_idx on public.veterinarian_services (service_id, veterinarian_id);

create table public.veterinarian_payment_methods (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  payment_method_id smallint not null references public.payment_methods (id) on delete restrict,
  parcelas_max smallint check (parcelas_max between 2 and 24),
  primary key (veterinarian_id, payment_method_id)
);
create index veterinarian_payment_methods_rev_idx
  on public.veterinarian_payment_methods (payment_method_id, veterinarian_id);

create table public.veterinarian_attendance_modes (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  attendance_mode_id smallint not null references public.attendance_modes (id) on delete restrict,
  primary key (veterinarian_id, attendance_mode_id)
);
create index veterinarian_attendance_modes_rev_idx
  on public.veterinarian_attendance_modes (attendance_mode_id, veterinarian_id);

-- Regiões cobertas em atendimento domiciliar
create table public.veterinarian_coverage_regions (
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  region_id smallint not null references public.regions (id) on delete restrict,
  primary key (veterinarian_id, region_id)
);
create index veterinarian_coverage_regions_rev_idx
  on public.veterinarian_coverage_regions (region_id, veterinarian_id);

-- ---------------------------------------------------------------------------
-- Eventos de contato (sem dados do tutor)
-- ---------------------------------------------------------------------------
create table public.contact_events (
  id bigint generated always as identity primary key,
  -- set null: eventos sobrevivem à remoção do perfil (ex.: limpeza dos demos)
  veterinarian_id uuid references public.veterinarians (id) on delete set null,
  vet_slug text not null,
  vet_is_demo boolean not null,
  canal public.contact_canal not null,
  origem public.contact_origem not null,
  filtros_usados jsonb not null default '{}'::jsonb
    check (jsonb_typeof(filtros_usados) = 'object'),
  created_at timestamptz not null default now()
);
create index contact_events_vet_created_idx on public.contact_events (veterinarian_id, created_at);
create index contact_events_created_idx on public.contact_events (created_at);

-- Snapshot do veterinário preenchido pelo servidor; o cliente não consegue falsificar.
create or replace function public.contact_events_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text;
  v_demo boolean;
begin
  select v.slug, v.is_demo into v_slug, v_demo
  from public.veterinarians v
  where v.id = new.veterinarian_id;

  if v_slug is null then
    raise exception 'veterinário inexistente' using errcode = 'foreign_key_violation';
  end if;

  new.vet_slug := v_slug;
  new.vet_is_demo := v_demo;
  new.created_at := now();
  return new;
end;
$$;

create trigger contact_events_snapshot
  before insert on public.contact_events
  for each row execute function public.contact_events_snapshot();

-- ---------------------------------------------------------------------------
-- Pré-cadastro de veterinários reais
-- ---------------------------------------------------------------------------
create table public.vet_waitlist (
  id bigint generated always as identity primary key,
  nome text not null check (length(trim(nome)) between 2 and 200),
  crmv_numero text not null check (crmv_numero ~ '^[0-9]{1,6}$'),
  crmv_uf char(2) not null check (crmv_uf ~ '^[A-Z]{2}$'),
  whatsapp text not null check (whatsapp ~ '^55[0-9]{10,11}$'),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  region_id smallint not null references public.regions (id) on delete restrict,
  especies text[] not null default '{}',
  modalidades text[] not null default '{}',
  consentimento_lgpd boolean not null check (consentimento_lgpd = true),
  created_at timestamptz not null default now()
);
create index vet_waitlist_created_idx on public.vet_waitlist (created_at);

-- FK não existe para arrays: valida slugs contra os catálogos.
create or replace function public.vet_waitlist_validate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from unnest(new.especies) s
    where not exists (select 1 from public.species sp where sp.slug = s)
  ) then
    raise exception 'espécie inválida' using errcode = 'check_violation';
  end if;

  if exists (
    select 1 from unnest(new.modalidades) m
    where not exists (select 1 from public.attendance_modes am where am.slug = m)
  ) then
    raise exception 'modalidade inválida' using errcode = 'check_violation';
  end if;

  new.created_at := now();
  return new;
end;
$$;

create trigger vet_waitlist_validate
  before insert or update on public.vet_waitlist
  for each row execute function public.vet_waitlist_validate();
