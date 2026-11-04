-- VetMeet: Rede (posts, fotos, marcações, curtidas, comentários e posts fixados).
-- Regras em CLAUDE.md, "Regras da Rede".

-- ---------------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------------
create type public.post_categoria as enum (
  'dica_tutores', 'relato_caso', 'atendimento', 'bastidores', 'curso_capacitacao', 'outros'
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  categoria public.post_categoria not null,
  texto text not null check (char_length(btrim(texto)) between 1 and 3000),
  -- Copiado do perfil do autor por trigger: o cliente não define.
  is_demo boolean not null default false,
  -- Fixado no perfil como portfólio (até 3 por veterinário).
  fixado_em timestamptz,
  -- Contadores mantidos por trigger (o feed não conta linha por linha).
  curtidas integer not null default 0 check (curtidas >= 0),
  comentarios integer not null default 0 check (comentarios >= 0),
  editado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_feed_idx on public.posts (created_at desc, id desc);
create index posts_autor_idx on public.posts (veterinarian_id, created_at desc);
create index posts_categoria_idx on public.posts (categoria, created_at desc);
create index posts_fixados_idx on public.posts (veterinarian_id) where fixado_em is not null;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create table public.post_images (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts (id) on delete cascade,
  -- Caminho no bucket fotos-rede: "{user_id}/{uuid}.webp" (ou .jpg no Safari).
  caminho text not null unique check (caminho ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|jpg)$'),
  largura integer not null check (largura between 1 and 4000),
  altura integer not null check (altura between 1 and 4000),
  -- 0 a 5 e único por post: no máximo 6 fotos.
  ordem smallint not null check (ordem between 0 and 5),
  unique (post_id, ordem)
);

create table public.post_species (
  post_id uuid not null references public.posts (id) on delete cascade,
  species_id smallint not null references public.species (id),
  primary key (post_id, species_id)
);
create index post_species_reverso_idx on public.post_species (species_id, post_id);

create table public.post_services (
  post_id uuid not null references public.posts (id) on delete cascade,
  service_id smallint not null references public.services (id),
  primary key (post_id, service_id)
);
create index post_services_reverso_idx on public.post_services (service_id, post_id);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, veterinarian_id)
);
create index post_likes_vet_idx on public.post_likes (veterinarian_id);

create table public.post_comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts (id) on delete cascade,
  veterinarian_id uuid not null references public.veterinarians (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index post_comments_post_idx on public.post_comments (post_id, created_at);
create index post_comments_vet_idx on public.post_comments (veterinarian_id);

-- ---------------------------------------------------------------------------
-- 2. Triggers
-- ---------------------------------------------------------------------------

-- Trava do post: o autor não troca de dono, de demo nem mexe nos contadores, e
-- fixa no máximo 3. pg_trigger_depth() = 1: alteração feita pelo próprio usuário
-- (os contadores chegam por outro trigger, com profundidade maior).
create or replace function public.posts_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    select v.is_demo into new.is_demo from public.veterinarians v where v.id = new.veterinarian_id;
    if coalesce(auth.role(), '') = 'authenticated' then
      new.curtidas := 0;
      new.comentarios := 0;
      new.editado_em := null;
      new.created_at := now();
    end if;
  elsif coalesce(auth.role(), '') = 'authenticated' and pg_trigger_depth() = 1 then
    new.veterinarian_id := old.veterinarian_id;
    new.is_demo := old.is_demo;
    new.curtidas := old.curtidas;
    new.comentarios := old.comentarios;
    new.created_at := old.created_at;
  end if;

  if new.fixado_em is not null and (tg_op = 'INSERT' or old.fixado_em is null) then
    if (select count(*) from public.posts p
        where p.veterinarian_id = new.veterinarian_id and p.fixado_em is not null and p.id <> new.id) >= 3 then
      raise exception 'limite_fixados' using errcode = 'P0001', hint = 'No máximo 3 posts fixados.';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.posts_guard() from public, anon, authenticated;

create trigger posts_guard
  before insert or update on public.posts
  for each row execute function public.posts_guard();

-- Contadores de curtidas e comentários. Security definer: quem curte não pode
-- alterar o post de outra pessoa diretamente.
create or replace function public.posts_contadores()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post uuid;
  v_delta integer;
begin
  if tg_op = 'INSERT' then
    v_post := new.post_id;
    v_delta := 1;
  else
    v_post := old.post_id;
    v_delta := -1;
  end if;

  if tg_table_name = 'post_likes' then
    update public.posts set curtidas = greatest(curtidas + v_delta, 0) where id = v_post;
  else
    update public.posts set comentarios = greatest(comentarios + v_delta, 0) where id = v_post;
  end if;
  return null;
end;
$$;
revoke execute on function public.posts_contadores() from public, anon, authenticated;

create trigger post_likes_contador
  after insert or delete on public.post_likes
  for each row execute function public.posts_contadores();
create trigger post_comments_contador
  after insert or delete on public.post_comments
  for each row execute function public.posts_contadores();

-- ---------------------------------------------------------------------------
-- 3. Funções auxiliares do RLS
-- ---------------------------------------------------------------------------

-- O perfil é do usuário logado e está no ar (só perfis ativos interagem).
create or replace function public.e_meu_perfil_ativo(p_vet uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.veterinarians v
    where v.id = p_vet and v.user_id = (select auth.uid()) and v.status = 'ativo'
  );
$$;
revoke execute on function public.e_meu_perfil_ativo(uuid) from public, anon;
grant execute on function public.e_meu_perfil_ativo(uuid) to authenticated;

create or replace function public.e_dono_do_post(p_post uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.posts p
    join public.veterinarians v on v.id = p.veterinarian_id
    where p.id = p_post and v.user_id = (select auth.uid())
  );
$$;
revoke execute on function public.e_dono_do_post(uuid) from public, anon;
grant execute on function public.e_dono_do_post(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.post_species enable row level security;
alter table public.post_services enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- posts: público lê os de perfis ativos; o autor lê, cria, altera e apaga os seus.
create policy "publico le posts de perfis ativos" on public.posts
  for select to anon, authenticated
  using (exists (select 1 from public.veterinarians v where v.id = veterinarian_id and v.status = 'ativo'));
create policy "autor le os proprios posts" on public.posts
  for select to authenticated using (public.e_dono_do_veterinario(veterinarian_id));
create policy "autor cria post" on public.posts
  for insert to authenticated with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "autor altera post" on public.posts
  for update to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id))
  with check (public.e_dono_do_veterinario(veterinarian_id));
create policy "autor apaga post" on public.posts
  for delete to authenticated using (public.e_dono_do_veterinario(veterinarian_id));

-- Fotos e marcações seguem a visibilidade do post; só o autor grava.
create policy "le com o post" on public.post_images
  for select to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "autor grava" on public.post_images
  for insert to authenticated
  with check (public.e_dono_do_post(post_id) and split_part(caminho, '/', 1) = (select auth.uid())::text);
create policy "autor apaga" on public.post_images
  for delete to authenticated using (public.e_dono_do_post(post_id));

create policy "le com o post" on public.post_species
  for select to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "autor grava" on public.post_species
  for insert to authenticated with check (public.e_dono_do_post(post_id));
create policy "autor apaga" on public.post_species
  for delete to authenticated using (public.e_dono_do_post(post_id));

create policy "le com o post" on public.post_services
  for select to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "autor grava" on public.post_services
  for insert to authenticated with check (public.e_dono_do_post(post_id));
create policy "autor apaga" on public.post_services
  for delete to authenticated using (public.e_dono_do_post(post_id));

-- Curtidas: só veterinários com perfil ativo, nunca no próprio post.
create policy "le com o post" on public.post_likes
  for select to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "veterinario curte post de outro" on public.post_likes
  for insert to authenticated
  with check (
    public.e_meu_perfil_ativo(veterinarian_id)
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.veterinarian_id <> post_likes.veterinarian_id
    )
  );
create policy "veterinario desfaz a propria curtida" on public.post_likes
  for delete to authenticated using (public.e_dono_do_veterinario(veterinarian_id));

-- Comentários: aparecem se o post e o autor do comentário estão no ar.
create policy "le comentarios visiveis" on public.post_comments
  for select to anon, authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_id)
    and exists (select 1 from public.veterinarians v where v.id = veterinarian_id and v.status = 'ativo')
  );
create policy "veterinario comenta" on public.post_comments
  for insert to authenticated
  with check (public.e_meu_perfil_ativo(veterinarian_id) and exists (select 1 from public.posts p where p.id = post_id));
-- Cada um apaga os seus; o autor do post apaga qualquer comentário no próprio post.
create policy "autor do comentario ou do post apaga" on public.post_comments
  for delete to authenticated
  using (public.e_dono_do_veterinario(veterinarian_id) or public.e_dono_do_post(post_id));

-- ---------------------------------------------------------------------------
-- 5. RPCs
-- ---------------------------------------------------------------------------

-- Cria ou edita um post com fotos e marcações numa transação. Security invoker:
-- o RLS do autor vale para cada linha.
create or replace function public.salvar_post(p jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_vet uuid;
  v_id uuid := nullif(p ->> 'id', '')::uuid;
begin
  select v.id into v_vet from public.veterinarians v where v.user_id = (select auth.uid());
  if v_vet is null then
    raise exception 'sem_perfil' using errcode = 'P0001';
  end if;

  if v_id is null then
    insert into public.posts (veterinarian_id, categoria, texto)
    values (v_vet, (p ->> 'categoria')::public.post_categoria, p ->> 'texto')
    returning id into v_id;
  else
    update public.posts
    set categoria = (p ->> 'categoria')::public.post_categoria,
        texto = p ->> 'texto',
        editado_em = now()
    where id = v_id and veterinarian_id = v_vet;
    if not found then
      raise exception 'post_nao_encontrado' using errcode = 'P0001';
    end if;
    delete from public.post_images where post_id = v_id;
    delete from public.post_species where post_id = v_id;
    delete from public.post_services where post_id = v_id;
  end if;

  insert into public.post_images (post_id, caminho, largura, altura, ordem)
  select v_id, f ->> 'caminho', (f ->> 'largura')::integer, (f ->> 'altura')::integer, (o - 1)::smallint
  from jsonb_array_elements(coalesce(p -> 'fotos', '[]'::jsonb)) with ordinality as t (f, o);

  insert into public.post_species (post_id, species_id)
  select v_id, s.id from public.species s
  where s.slug in (select jsonb_array_elements_text(coalesce(p -> 'especies', '[]'::jsonb)));

  insert into public.post_services (post_id, service_id)
  select v_id, s.id from public.services s
  where s.slug in (select jsonb_array_elements_text(coalesce(p -> 'servicos', '[]'::jsonb)));

  return v_id;
end;
$$;
revoke execute on function public.salvar_post(jsonb) from public, anon;
grant execute on function public.salvar_post(jsonb) to authenticated;

-- Feed: cronológico, filtrado, paginado por cursor (created_at, id).
-- Região do veterinário = locais de atendimento + cidades do domiciliar.
create or replace function public.buscar_posts(
  p_categoria public.post_categoria default null,
  p_especie text default null,
  p_servico text default null,
  p_regioes text[] default '{}',
  p_autor uuid default null,
  p_antes timestamptz default null,
  p_antes_id uuid default null,
  p_limite integer default 10
)
returns setof uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id
  from public.posts p
  where exists (select 1 from public.veterinarians v where v.id = p.veterinarian_id and v.status = 'ativo')
    and (p_categoria is null or p.categoria = p_categoria)
    and (p_autor is null or p.veterinarian_id = p_autor)
    and (p_especie is null or exists (
      select 1 from public.post_species ps join public.species s on s.id = ps.species_id
      where ps.post_id = p.id and s.slug = p_especie))
    and (p_servico is null or exists (
      select 1 from public.post_services ps join public.services s on s.id = ps.service_id
      where ps.post_id = p.id and s.slug = p_servico))
    and (coalesce(cardinality(p_regioes), 0) = 0
      or exists (
        select 1 from public.clinics c join public.regions r on r.id = c.region_id
        where c.veterinarian_id = p.veterinarian_id and r.slug = any (p_regioes))
      or exists (
        select 1 from public.veterinarian_coverage_regions vc join public.regions r on r.id = vc.region_id
        where vc.veterinarian_id = p.veterinarian_id and r.slug = any (p_regioes)))
    and (p_antes is null or (p.created_at, p.id) < (p_antes, p_antes_id))
  order by p.created_at desc, p.id desc
  limit least(greatest(coalesce(p_limite, 10), 1), 50);
$$;
grant execute on function public.buscar_posts(public.post_categoria, text, text, text[], uuid, timestamptz, uuid, integer)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Fotos da Rede (Storage): pasta = id do usuário
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-rede', 'fotos-rede', true, 3145728, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy "rede: dono le a propria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-rede' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "rede: dono envia foto" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-rede' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "rede: dono apaga foto" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-rede' and (storage.foldername(name))[1] = (select auth.uid())::text);
