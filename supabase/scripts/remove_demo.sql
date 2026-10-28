-- VetMeet: remove todos os perfis de demonstração e seus vínculos.
--
-- clinics e tabelas de junção caem por on delete cascade.
-- contact_events são PRESERVADOS: veterinarian_id vira null e os snapshots
-- vet_slug / vet_is_demo continuam identificando o perfil de origem.
--
-- Uso: npm run db:remove-demo   (ou cole no SQL Editor do Supabase)

begin;

create temp table _antes on commit drop as
select
  (select count(*) from public.veterinarians where is_demo) as vets_demo,
  (select count(*) from public.contact_events) as eventos_total,
  (select count(*) from public.contact_events where vet_is_demo) as eventos_demo;

delete from public.veterinarians where is_demo;

do $$
declare
  a record;
  eventos_depois bigint;
  eventos_demo_depois bigint;
  orfaos bigint;
begin
  select * into a from _antes;

  if exists (select 1 from public.veterinarians where is_demo) then
    raise exception 'ainda existem veterinários demo';
  end if;

  select
      (select count(*) from public.clinics c where not exists (select 1 from public.veterinarians v where v.id = c.veterinarian_id))
    + (select count(*) from public.veterinarian_species x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    + (select count(*) from public.veterinarian_specialties x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    + (select count(*) from public.veterinarian_services x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    + (select count(*) from public.veterinarian_payment_methods x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    + (select count(*) from public.veterinarian_attendance_modes x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    + (select count(*) from public.veterinarian_coverage_regions x where not exists (select 1 from public.veterinarians v where v.id = x.veterinarian_id))
    into orfaos;

  if orfaos > 0 then
    raise exception '% vínculos órfãos após remoção', orfaos;
  end if;

  select count(*) into eventos_depois from public.contact_events;
  select count(*) into eventos_demo_depois from public.contact_events where vet_is_demo;

  if eventos_depois <> a.eventos_total or eventos_demo_depois <> a.eventos_demo then
    raise exception 'contact_events alterados: % -> % (demo: % -> %)',
      a.eventos_total, eventos_depois, a.eventos_demo, eventos_demo_depois;
  end if;

  raise notice 'removidos % perfis demo; % contact_events preservados (% de perfis demo)',
    a.vets_demo, eventos_depois, eventos_demo_depois;
end $$;

commit;
