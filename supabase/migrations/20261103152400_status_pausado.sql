-- pausado: o próprio veterinário tirou o perfil da busca (volta quando quiser).
-- inativo: tirado do ar pelo admin (o veterinário não reverte).
alter type public.vet_status add value if not exists 'pausado';
