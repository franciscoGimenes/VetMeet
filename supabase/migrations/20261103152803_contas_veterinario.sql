-- Contas de veterinário: o perfil passa a pertencer a uma conta (auth.users),
-- o próprio veterinário cria e edita o perfil e os vínculos (sob RLS), aceites
-- de termos, denúncias de perfil e fotos no Storage. Perfis demo seguem sem conta.

-- ---------------------------------------------------------------------------
-- 1. Perfil ligado à conta
-- ---------------------------------------------------------------------------
-- Excluir a conta exclui o perfil (e, em cascata, clínicas e vínculos).
alter table public.veterinarians drop constraint veterinarians_user_id_fkey;
alter table public.veterinarians
  add constraint veterinarians_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- Inscrição secundária ("CRMV-SP nº 12345-S"). Entra na unicidade: a numeração
-- secundária é uma série à parte no mesmo conselho.
alter table public.veterinarians add column crmv_secundaria boolean not null default false;
drop index public.veterinarians_crmv_real_uq;
create unique index veterinarians_crmv_real_uq
  on public.veterinarians (crmv_uf, crmv_numero, crmv_secundaria) where not is_demo;

alter table public.veterinarians
  add constraint veterinarians_nome_tamanho_ck check (length(nome_exibicao) <= 120),
  add constraint veterinarians_bio_tamanho_ck check (bio is null or length(bio) <= 1500);

-- Guarda das gravações feitas pelo próprio veterinário (sessão logada). O RLS
-- decide QUAIS linhas ele pode gravar; este trigger decide QUAIS campos: dono,
-- demo, verificação do CRMV e endereço do perfil não são dele para mudar.
-- Service role e SQL Editor passam direto.
create or replace function public.veterinarians_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  s text;
begin
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.is_demo := false;
    new.crmv_verificado := false;
    if new.status not in ('rascunho', 'ativo') then
      new.status := 'ativo';
    end if;

    -- Endereço do perfil a partir do nome; com nome repetido, o CRMV desempata.
    base := trim(both '-' from left(
      trim(both '-' from regexp_replace(public.normalizar_texto(new.nome_exibicao), '[^a-z0-9]+', '-', 'g')),
      60));
    if base = '' then
      base := 'veterinario';
    end if;
    s := base;
    if exists (select 1 from public.veterinarians where slug = s) then
      s := base || '-' || lower(new.crmv_uf) || new.crmv_numero || case when new.crmv_secundaria then 's' else '' end;
    end if;
    while exists (select 1 from public.veterinarians where slug = s) loop
      s := base || '-' || substr(md5(random()::text), 1, 5);
    end loop;
    new.slug := s;
  else
    new.id := old.id;
    new.user_id := old.user_id;
    new.is_demo := old.is_demo;
    new.slug := old.slug;
    new.created_at := old.created_at;
    -- Trocar o CRMV desfaz a verificação (quando ela voltar a existir).
    if (new.crmv_numero, new.crmv_uf, new.crmv_secundaria)
       is distinct from (old.crmv_numero, old.crmv_uf, old.crmv_secundaria) then
      new.crmv_verificado := false;
    else
      new.crmv_verificado := old.crmv_verificado;
    end if;
    -- O veterinário só alterna entre ativo e pausado; perfil tirado do ar
    -- pelo admin (inativo) não volta sozinho.
    if new.status is distinct from old.status
       and (old.status = 'inativo' or new.status not in ('ativo', 'pausado')) then
      raise exception 'mudança de status não permitida' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.veterinarians_guard() from public, anon, authenticated;

create trigger veterinarians_guard
  before insert or update on public.veterinarians
  for each row execute function public.veterinarians_guard();

-- Excluir um perfil real tira o nome (que está no slug) dos registros que
-- sobrevivem a ele. Demos mantêm o slug, como antes.
create or replace function public.veterinarians_anonimiza()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not old.is_demo then
    update public.contact_events set vet_slug = 'perfil-excluido' where veterinarian_id = old.id;
    update public.reports set vet_slug = 'perfil-excluido' where veterinarian_id = old.id;
  end if;
  return old;
end;
$$;
revoke execute on function public.veterinarians_anonimiza() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. RLS do dono
-- ---------------------------------------------------------------------------
create policy "dono le o proprio perfil" on public.veterinarians
  for select to authenticated using (user_id = (select auth.uid()));
create policy "dono cria o proprio perfil" on public.veterinarians
  for insert to authenticated
  with check (user_id = (select auth.uid()) and not is_demo and not crmv_verificado);
create policy "dono altera o proprio perfil" on public.veterinarians
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- O veterinário dono do vínculo é o usuário logado (RLS do perfil continua valendo).
create or replace function public.e_dono_do_veterinario(p_vet uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.veterinarians v
    where v.id = p_vet and v.user_id = (select auth.uid())
  );
$$;
revoke execute on function public.e_dono_do_veterinario(uuid) from public, anon;
grant execute on function public.e_dono_do_veterinario(uuid) to authenticated;

create policy "dono gerencia" on public.clinics
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_species
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_specialties
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_services
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_payment_methods
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_attendance_modes
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "dono gerencia" on public.veterinarian_coverage_regions
  for all to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));

-- Salva o perfil inteiro numa transação (cria na primeira vez, já ativo).
-- security invoker: cada insert/delete passa pelo RLS e pelo trigger de guarda.
-- Os vínculos são substituídos; slugs desconhecidos são ignorados (a validação
-- de verdade está no servidor, src/lib/perfil.ts).
create or replace function public.salvar_meu_perfil(p jsonb)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'sessão expirada' using errcode = '42501';
  end if;

  select id into v_id from public.veterinarians where user_id = uid;

  if v_id is null then
    insert into public.veterinarians (
      user_id, slug, nome_exibicao, crmv_numero, crmv_uf, crmv_secundaria, whatsapp, instagram,
      anos_experiencia, bio, consulta_preco_min, consulta_preco_max,
      atende_emergencia, atende_fim_de_semana, atende_noturno, status
    ) values (
      uid, 'novo', p ->> 'nome', p ->> 'crmv_numero', p ->> 'crmv_uf',
      coalesce((p ->> 'crmv_secundaria')::boolean, false),
      p ->> 'whatsapp', nullif(p ->> 'instagram', ''), (p ->> 'anos_experiencia')::smallint,
      nullif(p ->> 'bio', ''), (p ->> 'consulta_preco_min')::numeric, (p ->> 'consulta_preco_max')::numeric,
      coalesce((p ->> 'atende_emergencia')::boolean, false),
      coalesce((p ->> 'atende_fim_de_semana')::boolean, false),
      coalesce((p ->> 'atende_noturno')::boolean, false),
      'ativo'
    )
    returning id, slug into v_id, v_slug;
  else
    update public.veterinarians set
      nome_exibicao = p ->> 'nome',
      crmv_numero = p ->> 'crmv_numero',
      crmv_uf = p ->> 'crmv_uf',
      crmv_secundaria = coalesce((p ->> 'crmv_secundaria')::boolean, false),
      whatsapp = p ->> 'whatsapp',
      instagram = nullif(p ->> 'instagram', ''),
      anos_experiencia = (p ->> 'anos_experiencia')::smallint,
      bio = nullif(p ->> 'bio', ''),
      consulta_preco_min = (p ->> 'consulta_preco_min')::numeric,
      consulta_preco_max = (p ->> 'consulta_preco_max')::numeric,
      atende_emergencia = coalesce((p ->> 'atende_emergencia')::boolean, false),
      atende_fim_de_semana = coalesce((p ->> 'atende_fim_de_semana')::boolean, false),
      atende_noturno = coalesce((p ->> 'atende_noturno')::boolean, false)
    where id = v_id
    returning slug into v_slug;
  end if;

  delete from public.veterinarian_species where veterinarian_id = v_id;
  insert into public.veterinarian_species (veterinarian_id, species_id)
  select v_id, s.id from public.species s
  where s.slug in (select jsonb_array_elements_text(coalesce(p -> 'especies', '[]')));

  delete from public.veterinarian_specialties where veterinarian_id = v_id;
  insert into public.veterinarian_specialties (veterinarian_id, specialty_id, principal)
  select v_id, s.id, s.slug = (p ->> 'area_principal') from public.specialties s
  where s.slug in (select jsonb_array_elements_text(coalesce(p -> 'areas', '[]')));

  delete from public.veterinarian_services where veterinarian_id = v_id;
  insert into public.veterinarian_services (veterinarian_id, service_id, preco_min, preco_max)
  select v_id, s.id, (x ->> 'preco_min')::numeric, (x ->> 'preco_max')::numeric
  from jsonb_array_elements(coalesce(p -> 'servicos', '[]')) x
  join public.services s on s.slug = x ->> 'slug';

  delete from public.veterinarian_payment_methods where veterinarian_id = v_id;
  insert into public.veterinarian_payment_methods (veterinarian_id, payment_method_id, parcelas_max)
  select v_id, m.id, (x ->> 'parcelas_max')::smallint
  from jsonb_array_elements(coalesce(p -> 'pagamentos', '[]')) x
  join public.payment_methods m on m.slug = x ->> 'slug';

  delete from public.veterinarian_attendance_modes where veterinarian_id = v_id;
  insert into public.veterinarian_attendance_modes (veterinarian_id, attendance_mode_id)
  select v_id, m.id from public.attendance_modes m
  where m.slug in (select jsonb_array_elements_text(coalesce(p -> 'modos', '[]')));

  delete from public.veterinarian_coverage_regions where veterinarian_id = v_id;
  insert into public.veterinarian_coverage_regions (veterinarian_id, region_id)
  select v_id, r.id from public.regions r
  where r.slug in (select jsonb_array_elements_text(coalesce(p -> 'cobertura', '[]')));

  delete from public.clinics where veterinarian_id = v_id;
  insert into public.clinics (veterinarian_id, nome, endereco, region_id, neighborhood_id)
  select v_id, x ->> 'nome', nullif(x ->> 'endereco', ''), r.id, n.id
  from jsonb_array_elements(coalesce(p -> 'locais', '[]')) x
  join public.regions r on r.slug = x ->> 'regiao'
  left join public.neighborhoods n on n.region_id = r.id and n.slug = x ->> 'bairro';

  return v_slug;
end;
$$;
revoke execute on function public.salvar_meu_perfil(jsonb) from public, anon;
grant execute on function public.salvar_meu_perfil(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Aceites (Termos de Uso, Política de Privacidade e declaração do CRMV)
-- ---------------------------------------------------------------------------
create table public.vet_consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  termos_versao text not null,
  privacidade_versao text not null,
  declaracao_crmv boolean not null check (declaracao_crmv),
  created_at timestamptz not null default now()
);
create index vet_consents_user_idx on public.vet_consents (user_id, created_at desc);
alter table public.vet_consents enable row level security;

create policy "dono registra o proprio aceite" on public.vet_consents
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "dono le os proprios aceites" on public.vet_consents
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Denúncias
-- ---------------------------------------------------------------------------
create type public.report_motivo as enum (
  'informacao_falsa', 'crmv_irregular', 'conduta_inadequada',
  'golpe_ou_cobranca_indevida', 'conteudo_improprio', 'outro'
);
create type public.report_status as enum ('aberta', 'analisada', 'descartada');

create table public.reports (
  id bigint generated always as identity primary key,
  veterinarian_id uuid references public.veterinarians (id) on delete set null,
  vet_slug text not null default '',
  motivo public.report_motivo not null,
  descricao text check (descricao is null or length(descricao) <= 1000),
  status public.report_status not null default 'aberta',
  -- HMAC do IP, para o limite de envios por hora. Nunca o IP em claro.
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index reports_veterinarian_idx on public.reports (veterinarian_id);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_ip_idx on public.reports (ip_hash, created_at);
alter table public.reports enable row level security;

-- Gravadas só pelo servidor (service role), depois de honeypot e limite por IP.
create policy "admin le denuncias" on public.reports
  for select to authenticated using (public.is_admin());
create policy "admin altera denuncias" on public.reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.reports_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select v.slug into new.vet_slug from public.veterinarians v where v.id = new.veterinarian_id;
  if new.vet_slug is null then
    raise exception 'perfil não encontrado' using errcode = 'foreign_key_violation';
  end if;
  new.created_at := now();
  return new;
end;
$$;
revoke execute on function public.reports_snapshot() from public, anon, authenticated;

create trigger reports_snapshot
  before insert on public.reports
  for each row execute function public.reports_snapshot();

create trigger veterinarians_anonimiza
  before delete on public.veterinarians
  for each row execute function public.veterinarians_anonimiza();

-- ---------------------------------------------------------------------------
-- 5. Lista de espera: deixa de ser cadastro, ganha o convite
-- ---------------------------------------------------------------------------
alter table public.vet_waitlist add column convidado_em timestamptz;
drop function public.publicar_pre_cadastro(bigint, text);

-- Lista para o painel, com "já tem conta" (exige ler auth.users, por isso
-- security definer; a primeira coisa que faz é conferir se é admin).
create or replace function public.admin_lista_espera()
returns table (
  id bigint, nome text, crmv_numero text, crmv_uf text, whatsapp text, email text,
  regioes text[], especies text[], modalidades text[], created_at timestamptz,
  convidado_em timestamptz, perfil_slug text, tem_conta boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'sem acesso' using errcode = '42501';
  end if;
  return query
    select w.id, w.nome, w.crmv_numero, w.crmv_uf::text, w.whatsapp, w.email,
           w.regioes, w.especies, w.modalidades, w.created_at, w.convidado_em, v.slug,
           exists (select 1 from auth.users u where lower(u.email) = lower(w.email))
    from public.vet_waitlist w
    left join public.veterinarians v on v.id = w.veterinarian_id
    order by w.created_at desc
    limit 300;
end;
$$;
revoke execute on function public.admin_lista_espera() from public, anon;
grant execute on function public.admin_lista_espera() to authenticated;

-- Admin agora exige e-mail confirmado: com cadastro por senha, um e-mail ainda
-- não confirmado não pode virar acesso ao painel.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. Fotos de perfil (Storage): pasta = id do usuário
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-veterinarios', 'fotos-veterinarios', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "dono le a propria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-veterinarios' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "dono envia a propria foto" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-veterinarios' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "dono troca a propria foto" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-veterinarios' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "dono apaga a propria foto" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-veterinarios' and (storage.foldername(name))[1] = (select auth.uid())::text);
