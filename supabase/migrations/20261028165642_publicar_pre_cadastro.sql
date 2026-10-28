-- MVP: o pré-cadastro publica o perfil na hora (status ativo, CRMV não verificado).
-- Comportamento temporário desta versão; desligue pela flag PUBLICAR_PRE_CADASTRO_DIRETO
-- em src/lib/mvp.ts. A função continua útil para um futuro botão "aprovar" no painel.

alter table public.vet_waitlist
  add column veterinarian_id uuid references public.veterinarians (id) on delete set null;
create index vet_waitlist_veterinarian_id_idx on public.vet_waitlist (veterinarian_id);

-- Cria o perfil a partir de uma linha do pré-cadastro, numa transação só.
-- Devolve o slug publicado. Só a service role pode chamar.
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
    insert into public.veterinarian_coverage_regions (veterinarian_id, region_id) values (v_id, w.region_id);
  end if;

  -- Sem endereço no formulário: o local fica só com a cidade, para a busca por cidade funcionar.
  if 'clinica_propria' = any (w.modalidades) then
    insert into public.clinics (veterinarian_id, nome, region_id) values (v_id, 'Consultório próprio', w.region_id);
  end if;

  update public.vet_waitlist set veterinarian_id = v_id where id = p_waitlist_id;
  return v_slug;
end;
$$;

revoke execute on function public.publicar_pre_cadastro(bigint, text) from public, anon, authenticated;
grant execute on function public.publicar_pre_cadastro(bigint, text) to service_role;
