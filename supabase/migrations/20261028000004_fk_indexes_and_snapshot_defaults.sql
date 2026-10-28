-- Índices cobrindo FKs apontadas pelo advisor de performance.
drop index public.clinics_neighborhood_id_idx;
create index clinics_neighborhood_region_idx on public.clinics (neighborhood_id, region_id);
create index vet_waitlist_region_id_idx on public.vet_waitlist (region_id);

-- Snapshots são sempre preenchidos pelo trigger contact_events_snapshot; os
-- defaults só tornam as colunas opcionais no insert do cliente.
alter table public.contact_events alter column vet_slug set default '';
alter table public.contact_events alter column vet_is_demo set default false;
