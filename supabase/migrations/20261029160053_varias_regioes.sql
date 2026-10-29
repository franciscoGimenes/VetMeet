-- Várias regiões: na busca (filtrar por mais de uma cidade/subprefeitura) e no
-- pré-cadastro (o profissional atende em mais de uma, ex.: Itaquá, Poá e Ferraz).

-- 1. Busca: p_regiao/p_bairro viram listas. Bairros chegam qualificados como
-- "regiao.bairro" (o slug do bairro só é único dentro da cidade). Uma cidade
-- com bairros escolhidos fica restrita a eles; as outras valem inteiras.
drop function public.buscar_veterinarios(
  text, text, text, text, text, text[], text[], boolean, boolean, boolean, numeric, integer, integer, text
);

create or replace function public.buscar_veterinarios(
  p_regioes text[] default null,
  p_bairros text[] default null,
  p_especie text default null,
  p_area text default null,
  p_servico text default null,
  p_modos text[] default null,
  p_pagamentos text[] default null,
  p_emergencia boolean default false,
  p_fim_de_semana boolean default false,
  p_noturno boolean default false,
  p_preco_max numeric default null,
  p_limite integer default 12,
  p_offset integer default 0,
  p_q text default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with termos as (
    select replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_') as termo
    from unnest(regexp_split_to_array(public.normalizar_texto(trim(left(coalesce(p_q, ''), 60))), '\s+')) as t
    where t <> ''
  ),
  q_normalizado as (
    select public.normalizar_texto(trim(left(coalesce(p_q, ''), 60))) as q
  ),
  com_local as (
    select coalesce(cardinality(p_regioes), 0) > 0 as ativo
  ),
  modos_considerados as (
    select am.id, am.slug
    from public.attendance_modes am
    where case
      when coalesce(cardinality(p_modos), 0) > 0 then am.slug = any (p_modos)
      when (select ativo from com_local) then am.slug in ('clinica_propria', 'domiciliar')
      else true
    end
  ),
  filtrados as (
    select v.id, v.is_demo, v.nome_exibicao
    from public.veterinarians v
    where v.status = 'ativo'
      and not exists (
        select 1 from termos t
        where public.normalizar_texto(v.nome_exibicao) not like '%' || t.termo || '%'
          and not exists (
            select 1 from public.clinics c
            where c.veterinarian_id = v.id
              and public.normalizar_texto(c.nome) like '%' || t.termo || '%'
          )
      )
      and (p_especie is null or exists (
        select 1 from public.veterinarian_species x
        join public.species s on s.id = x.species_id
        where x.veterinarian_id = v.id and s.slug = p_especie))
      and (p_area is null or exists (
        select 1 from public.veterinarian_specialties x
        join public.specialties s on s.id = x.specialty_id
        where x.veterinarian_id = v.id and s.slug = p_area))
      and (p_servico is null or exists (
        select 1 from public.veterinarian_services x
        join public.services s on s.id = x.service_id
        where x.veterinarian_id = v.id and s.slug = p_servico))
      and (coalesce(cardinality(p_pagamentos), 0) = 0 or exists (
        select 1 from public.veterinarian_payment_methods x
        join public.payment_methods pm on pm.id = x.payment_method_id
        where x.veterinarian_id = v.id and pm.slug = any (p_pagamentos)))
      and (not p_emergencia or v.atende_emergencia)
      and (not p_fim_de_semana or v.atende_fim_de_semana)
      and (not p_noturno or v.atende_noturno)
      and (p_preco_max is null or v.consulta_preco_min <= p_preco_max)
      and exists (
        select 1
        from public.veterinarian_attendance_modes vam
        join modos_considerados m on m.id = vam.attendance_mode_id
        where vam.veterinarian_id = v.id
          and (
            not (select ativo from com_local)
            or m.slug = 'teleorientacao'
            or (m.slug = 'clinica_propria' and exists (
              select 1 from public.clinics c
              join public.regions r on r.id = c.region_id
              left join public.neighborhoods n on n.id = c.neighborhood_id
              where c.veterinarian_id = v.id
                and r.slug = any (p_regioes)
                and (
                  not exists (select 1 from unnest(p_bairros) b where split_part(b, '.', 1) = r.slug)
                  or (r.slug || '.' || n.slug) = any (p_bairros)
                )))
            or (m.slug = 'domiciliar' and exists (
              select 1 from public.veterinarian_coverage_regions cr
              join public.regions r on r.id = cr.region_id
              where cr.veterinarian_id = v.id and r.slug = any (p_regioes)))
          )
      )
  ),
  pagina as (
    select f.id, row_number() over (
      order by
        f.is_demo,
        -- com nome: começa com o termo (ignorando "Dr."/"Dra.") vem antes
        case
          when (select q from q_normalizado) = '' then 0
          when regexp_replace(public.normalizar_texto(f.nome_exibicao), '^dra?\.?\s+', '')
               like (select replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') from q_normalizado) || '%'
            then 0
          else 1
        end,
        md5(f.id::text || current_date::text)
    ) as ordem
    from filtrados f
    order by ordem
    limit greatest(p_limite, 0)
    offset greatest(p_offset, 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from filtrados),
    'ids', coalesce((select jsonb_agg(id order by ordem) from pagina), '[]'::jsonb)
  );
$$;

grant execute on function public.buscar_veterinarios(
  text[], text[], text, text, text, text[], text[], boolean, boolean, boolean, numeric, integer, integer, text
) to anon, authenticated;

-- 2. Registro de buscas: o local vira lista (uma busca pode ter várias cidades).
alter table public.search_events
  alter column local type text[] using case when local is null then null else array[local] end;

-- 3. Pré-cadastro: regiões em lista de slugs, como espécies e modalidades.
alter table public.vet_waitlist add column regioes text[] not null default '{}';
update public.vet_waitlist w set regioes = array[r.slug] from public.regions r where r.id = w.region_id;
alter table public.vet_waitlist drop column region_id;
alter table public.vet_waitlist
  add constraint vet_waitlist_regioes_check check (cardinality(regioes) between 1 and 22);

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

  if exists (
    select 1 from unnest(new.regioes) r
    where not exists (select 1 from public.regions rg where rg.slug = r)
  ) then
    raise exception 'região inválida' using errcode = 'check_violation';
  end if;

  new.created_at := now();
  return new;
end;
$$;

-- Publica com cobertura domiciliar em todas as regiões escolhidas e um
-- "Consultório próprio" (sem endereço) em cada uma, para a busca por cidade achar.
create or replace function public.publicar_pre_cadastro(p_waitlist_id bigint, p_slug text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  w public.vet_waitlist;
  v_id uuid;
  v_slug text := p_slug;
begin
  select * into w from public.vet_waitlist where id = p_waitlist_id;
  if not found then
    raise exception 'pré-cadastro % não encontrado', p_waitlist_id;
  end if;

  -- Nome repetido: diferencia pelo CRMV (único entre perfis reais).
  if exists (select 1 from public.veterinarians where slug = v_slug) then
    v_slug := v_slug || '-' || lower(w.crmv_uf) || w.crmv_numero;
  end if;

  insert into public.veterinarians (slug, nome_exibicao, crmv_numero, crmv_uf, crmv_verificado, whatsapp, status, is_demo)
  values (v_slug, w.nome, w.crmv_numero, w.crmv_uf, false, w.whatsapp, 'ativo', false)
  returning id into v_id;

  insert into public.veterinarian_species (veterinarian_id, species_id)
  select v_id, s.id from public.species s where s.slug = any (w.especies);

  insert into public.veterinarian_attendance_modes (veterinarian_id, attendance_mode_id)
  select v_id, m.id from public.attendance_modes m where m.slug = any (w.modalidades);

  if 'domiciliar' = any (w.modalidades) then
    insert into public.veterinarian_coverage_regions (veterinarian_id, region_id)
    select v_id, r.id from public.regions r where r.slug = any (w.regioes);
  end if;

  if 'clinica_propria' = any (w.modalidades) then
    insert into public.clinics (veterinarian_id, nome, region_id)
    select v_id, 'Consultório próprio', r.id from public.regions r where r.slug = any (w.regioes);
  end if;

  update public.vet_waitlist set veterinarian_id = v_id where id = p_waitlist_id;
  return v_slug;
end;
$$;

revoke execute on function public.publicar_pre_cadastro(bigint, text) from public, anon, authenticated;
grant execute on function public.publicar_pre_cadastro(bigint, text) to service_role;

-- 4. Painel: "cidades mais buscadas" conta cada cidade de uma busca com várias.
create or replace function public.painel_admin(p_dias integer default 30)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  inicio date := hoje - (greatest(p_dias, 1) - 1);
  desde timestamptz := (inicio::timestamp at time zone 'America/Sao_Paulo');
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'inicio', inicio,
    'fim', hoje,

    'totais', jsonb_build_object(
      'cliques', (select count(*) from public.contact_events where created_at >= desde),
      'cliques_demo', (select count(*) from public.contact_events where created_at >= desde and vet_is_demo),
      'buscas', (select count(*) from public.search_events where created_at >= desde),
      'buscas_sem_resultado', (select count(*) from public.search_events where created_at >= desde and total = 0),
      'pre_cadastros', (select count(*) from public.vet_waitlist where created_at >= desde),
      'pre_cadastros_total', (select count(*) from public.vet_waitlist)
    ),

    'cliques_por_dia', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'dia', d.dia,
        'total', coalesce(c.total, 0),
        'whatsapp', coalesce(c.whatsapp, 0),
        'demo', coalesce(c.demo, 0)
      ) order by d.dia), '[]'::jsonb)
      from (select generate_series(inicio, hoje, interval '1 day')::date as dia) d
      left join (
        select (created_at at time zone 'America/Sao_Paulo')::date as dia,
               count(*) as total,
               count(*) filter (where canal = 'whatsapp') as whatsapp,
               count(*) filter (where vet_is_demo) as demo
        from public.contact_events
        where created_at >= desde
        group by 1
      ) c on c.dia = d.dia
    ),

    'filtros', (
      select coalesce(jsonb_agg(jsonb_build_object('chave', chave, 'valor', valor, 'total', total)), '[]'::jsonb)
      from (
        select f.key as chave, v.valor, count(*) as total
        from public.search_events s
        cross join lateral jsonb_each(s.filtros) f
        cross join lateral (
          select jsonb_array_elements_text(f.value) as valor where jsonb_typeof(f.value) = 'array'
          union all
          select f.value #>> '{}' where jsonb_typeof(f.value) <> 'array'
        ) v
        where s.created_at >= desde and f.key not in ('local', 'bairro')
        group by 1, 2
        order by 3 desc, 1, 2
        limit 15
      ) t
    ),

    'cidades', (
      select coalesce(jsonb_agg(jsonb_build_object('local', local, 'total', total, 'sem_resultado', sem_resultado)), '[]'::jsonb)
      from (
        select l.local, count(*) as total, count(*) filter (where s.total = 0) as sem_resultado
        from public.search_events s
        cross join lateral unnest(s.local) as l(local)
        where s.created_at >= desde
        group by 1
        order by 2 desc, 1
        limit 15
      ) t
    ),

    'veterinarios', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'slug', vet_slug, 'demo', vet_is_demo, 'total', total,
        'whatsapp', whatsapp, 'perfil', perfil, 'card', card
      )), '[]'::jsonb)
      from (
        select vet_slug, vet_is_demo, count(*) as total,
               count(*) filter (where canal = 'whatsapp') as whatsapp,
               count(*) filter (where origem = 'perfil') as perfil,
               count(*) filter (where origem = 'card') as card
        from public.contact_events
        where created_at >= desde
        group by 1, 2
        order by 3 desc, 1
        limit 15
      ) t
    )
  );
end;
$$;
revoke execute on function public.painel_admin(integer) from public, anon;
grant execute on function public.painel_admin(integer) to authenticated;
