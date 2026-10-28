-- Painel sem SECURITY DEFINER: o admin lê via RLS e as funções rodam com as
-- permissões de quem chama.

-- Cada usuário logado enxerga só a própria linha em admins (se existir).
create policy "ve o proprio registro de admin" on public.admins
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

alter function public.is_admin() security invoker;

create policy "admin le eventos de contato" on public.contact_events
  for select to authenticated using (public.is_admin());

create policy "admin le buscas" on public.search_events
  for select to authenticated using (public.is_admin());

alter function public.painel_admin(integer) security invoker;
