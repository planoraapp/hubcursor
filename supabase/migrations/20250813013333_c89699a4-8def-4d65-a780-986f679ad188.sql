
-- Índices para eliminar timeouts e acelerar filtros/ordenações
-- habbo_activities: consultas por hotel + created_at e por (habbo_name, hotel) + created_at
create index if not exists idx_habbo_activities_hotel_created_at
  on public.habbo_activities (hotel, created_at desc);

create index if not exists idx_habbo_activities_user_hotel_created_at
  on public.habbo_activities (habbo_name, hotel, created_at desc);

-- habbo_user_snapshots: consultas por hotel + created_at, por habbo_id + created_at e por nome em lower()
create index if not exists idx_habbo_user_snapshots_hotel_created_at
  on public.habbo_user_snapshots (hotel, created_at desc);

create index if not exists idx_habbo_user_snapshots_habbo_id_created_at
  on public.habbo_user_snapshots (habbo_id, created_at desc);

create index if not exists idx_habbo_user_snapshots_habbo_name_lower
  on public.habbo_user_snapshots ((lower(habbo_name)));

-- Índice parcial para "online agora" recente (otimiza contagem/listagem)
create index if not exists idx_habbo_user_snapshots_online_recent
  on public.habbo_user_snapshots (hotel, created_at desc)
  where is_online = true;

-- Função pública para obter dados mínimos do usuário por nome
-- Usa o snapshot mais recente; agrega campos esperados pela EnhancedHabboHome
create or replace function public.get_habbo_account_public_by_name(habbo_name_param text)
returns table (
  supabase_user_id uuid,
  habbo_name text,
  habbo_id text,
  hotel text,
  figure_string text,
  motto text,
  is_online boolean,
  created_at timestamptz,
  last_updated timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with latest as (
    select s.*
    from public.habbo_user_snapshots s
    where lower(s.habbo_name) = lower(habbo_name_param)
    order by s.created_at desc
    limit 1
  )
  select
    a.supabase_user_id,
    coalesce(a.habbo_name, l.habbo_name) as habbo_name,
    coalesce(a.habbo_id, l.habbo_id)       as habbo_id,
    coalesce(a.hotel, l.hotel)             as hotel,
    l.figure_string,
    l.motto,
    l.is_online,
    l.created_at,
    (
      select max(ss.created_at)
      from public.habbo_user_snapshots ss
      where ss.habbo_id = l.habbo_id
    ) as last_updated
  from latest l
  left join public.habbo_accounts a
    on lower(a.habbo_name) = lower(habbo_name_param);
end;
$$;

-- Permissões para que o frontend possa usar a função
grant execute on function public.get_habbo_account_public_by_name(text) to anon;
