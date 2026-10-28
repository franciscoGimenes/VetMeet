-- Painel administrativo: registro de buscas, lista de admins e agregações.

-- Buscas feitas no site (só os filtros e o total, sem dado do visitante).
-- Gravadas pelo servidor com a service role; nada é acessível a anon.
create table public.search_events (
  id bigint generated always as identity primary key,
  filtros jsonb not null default '{}'::jsonb check (jsonb_typeof(filtros) = 'object'),
  local text,
  total integer not null check (total >= 0),
  created_at timestamptz not null default now()
);
create index search_events_created_idx on public.search_events (created_at);
alter table public.search_events enable row level security;

-- Quem pode ver o painel. Gerenciada só pelo SQL Editor / service role.
create table public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Admin lê o pré-cadastro (para a lista e o CSV).
create policy "admin le pre-cadastro" on public.vet_waitlist
  for select to authenticated using (public.is_admin());

-- Todas as agregações do painel numa chamada. Datas no fuso de São Paulo.
create or replace function public.painel_admin(p_dias integer default 30)
returns jsonb
language plpgsql
stable
security definer
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
        select local, count(*) as total, count(*) filter (where total = 0) as sem_resultado
        from public.search_events
        where created_at >= desde and local is not null
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
