-- Busca por nome do veterinário e da clínica, sem acento e sem diferenciar
-- maiúsculas, aceitando trecho do nome ("fern" encontra "Fernanda").

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- unaccent() não é IMMUTABLE (depende do dicionário configurado), então não
-- pode ir num índice. Fixando o dicionário, a função vira determinística.
create or replace function public.normalizar_texto(texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(texto, '')));
$$;

-- Índices trigrama: aceleram LIKE '%trecho%' sobre o texto normalizado
-- (a partir de 3 caracteres; abaixo disso o Postgres varre, o que é barato aqui).
create index veterinarians_nome_trgm_idx
  on public.veterinarians using gin (public.normalizar_texto(nome_exibicao) extensions.gin_trgm_ops);
create index clinics_nome_trgm_idx
  on public.clinics using gin (public.normalizar_texto(nome) extensions.gin_trgm_ops);

-- A busca ganha o parâmetro p_q. Mudar a assinatura criaria uma sobrecarga,
-- então a versão antiga sai antes.
drop function public.buscar_veterinarios(
  text, text, text, text, text, text[], text[], boolean, boolean, boolean, numeric, integer, integer
);

-- Regras de nome (p_q):
-- - cada palavra digitada precisa aparecer no nome do veterinário ou no nome de
--   alguma clínica dele (palavras podem cair em campos diferentes);
-- - sem acento, sem maiúsculas, trecho em qualquer posição;
-- - % e _ digitados são tratados como texto, não como curinga.
-- Ordem: reais antes de demo; com nome, quem começa com o termo vem primeiro;
-- depois o embaralhamento estável do dia.
create or replace function public.buscar_veterinarios(
  p_regiao text default null,
  p_bairro text default null,
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
  modos_considerados as (
    select am.id, am.slug
    from public.attendance_modes am
    where case
      when coalesce(cardinality(p_modos), 0) > 0 then am.slug = any (p_modos)
      when p_regiao is not null then am.slug in ('clinica_propria', 'domiciliar')
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
            p_regiao is null
            or m.slug = 'teleorientacao'
            or (m.slug = 'clinica_propria' and exists (
              select 1 from public.clinics c
              join public.regions r on r.id = c.region_id
              left join public.neighborhoods n on n.id = c.neighborhood_id
              where c.veterinarian_id = v.id
                and r.slug = p_regiao
                and (p_bairro is null or n.slug = p_bairro)))
            or (m.slug = 'domiciliar' and exists (
              select 1 from public.veterinarian_coverage_regions cr
              join public.regions r on r.id = cr.region_id
              where cr.veterinarian_id = v.id and r.slug = p_regiao))
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
  text, text, text, text, text, text[], text[], boolean, boolean, boolean, numeric, integer, integer, text
) to anon, authenticated;
