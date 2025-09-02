-- Create users table for HabboHub
create table public.users (
    id               bigint generated always as identity primary key,
    habbo_username   text not null unique,
    habbo_motto      text not null,
    habbo_avatar     text,
    password_hash    text not null,
    email            text,
    is_admin         boolean default false,
    is_verified      boolean default false,
    last_login       timestamptz,
    created_at       timestamptz default now(),
    updated_at       timestamptz default now()
);

-- Create indexes for faster lookups
create index idx_users_habbo_username on public.users(habbo_username);
create index idx_users_email on public.users(email);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies
-- Users can read their own data
create policy "Users can view own data" on public.users
    for select using (auth.uid()::text = id::text);

-- Users can update their own data
create policy "Users can update own data" on public.users
    for update using (auth.uid()::text = id::text);

-- Service role can do everything (for Edge Functions)
create policy "Service role can do everything" on public.users
    for all using (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
create trigger update_users_updated_at 
    before update on public.users 
    for each row 
    execute function update_updated_at_column();

-- Insert sample data (optional)
-- insert into public.users (habbo_username, habbo_motto, password_hash, is_admin) 
-- values ('habbohub', 'HUB-HA2VEA', 'sample_hash', true);
