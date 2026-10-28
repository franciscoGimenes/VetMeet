-- Pré-cadastro passa a ser gravado só pelo servidor (service role).
--
-- Com insert público, qualquer um podia gravar em vet_waitlist direto pela API
-- do Supabase usando a chave pública, contornando honeypot e limite por IP do
-- formulário. Agora o formulário chama uma Server Action, que valida, aplica
-- o limite e insere com a service role (que ignora RLS).

drop policy "pre-cadastro" on public.vet_waitlist;

-- Tentativas por IP para o limite de envio. Guarda só um hash do IP (HMAC com
-- segredo do servidor), nunca o IP em claro. Linhas com mais de 1 dia são
-- apagadas a cada chamada.
create table public.vet_waitlist_tentativas (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index vet_waitlist_tentativas_ip_idx on public.vet_waitlist_tentativas (ip_hash, created_at);

-- RLS ligado e nenhuma policy: inacessível para anon/authenticated.
alter table public.vet_waitlist_tentativas enable row level security;

-- Registra a tentativa e diz se ainda está dentro do limite.
create or replace function public.pre_cadastro_permitido(
  p_ip_hash text,
  p_limite integer default 5,
  p_janela_minutos integer default 60
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tentativas integer;
begin
  -- serializa tentativas simultâneas do mesmo IP
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));

  delete from public.vet_waitlist_tentativas where created_at < now() - interval '1 day';

  insert into public.vet_waitlist_tentativas (ip_hash) values (p_ip_hash);

  select count(*) into tentativas
  from public.vet_waitlist_tentativas
  where ip_hash = p_ip_hash
    and created_at > now() - make_interval(mins => p_janela_minutos);

  return tentativas <= p_limite;
end;
$$;

revoke execute on function public.pre_cadastro_permitido(text, integer, integer) from public, anon, authenticated;
grant execute on function public.pre_cadastro_permitido(text, integer, integer) to service_role;
