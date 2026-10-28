-- Busca pública de veterinários, filtrada no servidor e paginada.
--
-- security invoker: roda com as permissões de quem chama, então o RLS continua
-- valendo (anon só enxerga perfis ativos e seus vínculos).
--
-- Localização x modalidade: o vet entra se, para alguma modalidade considerada,
--   clinica_propria -> tem local próprio na região (e no bairro, se informado)
--   domiciliar      -> cobre a região (cobertura é por região; bairro não restringe)
--   teleorientacao  -> atende remoto (independe de localização)
-- Modalidades consideradas: as escolhidas no filtro; sem filtro e com
-- localização, só as presenciais (quem busca por lugar quer atendimento ali);
-- sem filtro e sem localização, todas.
--
-- Ordem: perfis reais antes dos demo; dentro de cada grupo, um embaralhamento
-- estável por dia, para não favorecer sempre os mesmos profissionais e manter
-- a paginação consistente ao longo do dia.

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
  p_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with modos_considerados as (
    select am.id, am.slug
    from public.attendance_modes am
    where case
      when coalesce(cardinality(p_modos), 0) > 0 then am.slug = any (p_modos)
      when p_regiao is not null then am.slug in ('clinica_propria', 'domiciliar')
      else true
    end
  ),
  filtrados as (
    select v.id, v.is_demo
    from public.veterinarians v
    where v.status = 'ativo'
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
    select id, row_number() over (
      order by is_demo, md5(id::text || current_date::text)
    ) as ordem
    from filtrados
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
  text, text, text, text, text, text[], text[], boolean, boolean, boolean, numeric, integer, integer
) to anon, authenticated;
