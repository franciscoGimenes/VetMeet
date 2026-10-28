-- VetMeet: Row Level Security.
-- Leitura pública: catálogos e veterinários ativos (com seus vínculos).
-- Escrita pública: apenas contact_events e vet_waitlist (insert).
-- Todo o resto só via service role (que ignora RLS).

alter table public.regions enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.species enable row level security;
alter table public.specialties enable row level security;
alter table public.services enable row level security;
alter table public.attendance_modes enable row level security;
alter table public.payment_methods enable row level security;
alter table public.veterinarians enable row level security;
alter table public.clinics enable row level security;
alter table public.veterinarian_species enable row level security;
alter table public.veterinarian_specialties enable row level security;
alter table public.veterinarian_services enable row level security;
alter table public.veterinarian_payment_methods enable row level security;
alter table public.veterinarian_attendance_modes enable row level security;
alter table public.veterinarian_coverage_regions enable row level security;
alter table public.contact_events enable row level security;
alter table public.vet_waitlist enable row level security;

-- Catálogos -----------------------------------------------------------------
create policy "catalogo leitura publica" on public.regions
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.neighborhoods
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.species
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.specialties
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.services
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.attendance_modes
  for select to anon, authenticated using (true);
create policy "catalogo leitura publica" on public.payment_methods
  for select to anon, authenticated using (true);

-- Veterinários ativos -------------------------------------------------------
create policy "vet ativo leitura publica" on public.veterinarians
  for select to anon, authenticated using (status = 'ativo');

-- Vínculos: visíveis só quando o veterinário está ativo.
-- O exists passa pela policy de veterinarians, que já filtra status = 'ativo'.
create policy "vinculo de vet ativo" on public.clinics
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_species
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_specialties
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_services
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_payment_methods
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_attendance_modes
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));
create policy "vinculo de vet ativo" on public.veterinarian_coverage_regions
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));

-- Inserções públicas --------------------------------------------------------
create policy "registro de contato" on public.contact_events
  for insert to anon, authenticated
  with check (exists (select 1 from public.veterinarians v where v.id = veterinarian_id));

create policy "pre-cadastro" on public.vet_waitlist
  for insert to anon, authenticated
  with check (consentimento_lgpd = true);

-- Funções de trigger não devem ser chamáveis via RPC.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.contact_events_snapshot() from public, anon, authenticated;
revoke execute on function public.vet_waitlist_validate() from public, anon, authenticated;
