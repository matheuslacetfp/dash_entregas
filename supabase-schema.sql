-- Run this script in Supabase SQL Editor before publishing the dashboard.
-- The frontend uses only the public anon key. Never put a service_role key in GitHub Pages.

create extension if not exists pgcrypto;

create table if not exists public.deliveries (
  id text primary key,
  order_date date not null,
  due_date date not null,
  delivered_date date,
  status text not null,
  client text not null,
  region text,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_videos (
  id text primary key,
  title text not null,
  status text not null default 'Em análise',
  attract text not null default 'Não avaliado',
  brand text not null default 'Não avaliado',
  connect text not null default 'Não avaliado',
  direct text not null default 'Não avaliado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null check (color in ('Azul', 'Vermelho', 'Verde', 'Amarelo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.validation_options (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('attract', 'brand', 'connect', 'direct')),
  label text not null,
  color text not null check (color in ('Azul', 'Vermelho', 'Verde', 'Amarelo')),
  score smallint not null check (score in (-5, 0, 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(stage, label)
);

create table if not exists public.video_history (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  title text not null,
  status text not null,
  added_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_videos_updated_at on public.content_videos;
create trigger content_videos_updated_at before update on public.content_videos
for each row execute function public.set_updated_at();

drop trigger if exists deliveries_updated_at on public.deliveries;
create trigger deliveries_updated_at before update on public.deliveries
for each row execute function public.set_updated_at();

drop trigger if exists video_statuses_updated_at on public.video_statuses;
create trigger video_statuses_updated_at before update on public.video_statuses
for each row execute function public.set_updated_at();

drop trigger if exists validation_options_updated_at on public.validation_options;
create trigger validation_options_updated_at before update on public.validation_options
for each row execute function public.set_updated_at();

insert into public.video_statuses (name, color) values
  ('Em análise', 'Azul'), ('Aprovado', 'Verde'), ('Ajustes', 'Amarelo'), ('Reprovado', 'Vermelho')
on conflict (name) do nothing;

insert into public.validation_options (stage, label, color, score) values
  ('attract', 'Não avaliado', 'Amarelo', 0),
  ('attract', 'Forte gancho inicial', 'Verde', 5),
  ('attract', 'Visual dinâmico', 'Verde', 5),
  ('attract', 'Ritmo oscila no meio', 'Amarelo', 0),
  ('attract', 'Arco tradicional lento', 'Vermelho', -5),
  ('brand', 'Não avaliado', 'Amarelo', 0),
  ('brand', 'Marca tardia (>5s)', 'Amarelo', 0),
  ('brand', 'Uso em contexto', 'Verde', 5),
  ('brand', 'Faltar ver + ouvir marca', 'Vermelho', -5),
  ('brand', 'Marca central na história', 'Verde', 5),
  ('connect', 'Não avaliado', 'Amarelo', 0),
  ('connect', 'Humano e próximo', 'Verde', 5),
  ('connect', 'Formato UGC natural', 'Verde', 5),
  ('connect', 'Olhar direto na lente', 'Verde', 5),
  ('connect', 'Tom confiável e direto', 'Verde', 5),
  ('direct', 'Não avaliado', 'Amarelo', 0),
  ('direct', 'CTA pouco evidente', 'Vermelho', -5),
  ('direct', 'Texto fora de safe zone', 'Vermelho', -5),
  ('direct', 'CTA genérico sem incentivo', 'Vermelho', -5),
  ('direct', 'Comando claro ao final', 'Verde', 5)
on conflict (stage, label) do nothing;

alter table public.content_videos enable row level security;
alter table public.deliveries enable row level security;
alter table public.video_statuses enable row level security;
alter table public.validation_options enable row level security;
alter table public.video_history enable row level security;

drop policy if exists "public read content videos" on public.content_videos;
create policy "public read content videos" on public.content_videos for select to anon, authenticated using (true);
drop policy if exists "public write content videos" on public.content_videos;
create policy "public write content videos" on public.content_videos for all to anon, authenticated using (true) with check (true);

drop policy if exists "public read deliveries" on public.deliveries;
create policy "public read deliveries" on public.deliveries for select to anon, authenticated using (true);
drop policy if exists "public write deliveries" on public.deliveries;
create policy "public write deliveries" on public.deliveries for all to anon, authenticated using (true) with check (true);

drop policy if exists "public read video statuses" on public.video_statuses;
create policy "public read video statuses" on public.video_statuses for select to anon, authenticated using (true);
drop policy if exists "public write video statuses" on public.video_statuses;
create policy "public write video statuses" on public.video_statuses for all to anon, authenticated using (true) with check (true);

drop policy if exists "public read validation options" on public.validation_options;
create policy "public read validation options" on public.validation_options for select to anon, authenticated using (true);
drop policy if exists "public write validation options" on public.validation_options;
create policy "public write validation options" on public.validation_options for all to anon, authenticated using (true) with check (true);

drop policy if exists "public read video history" on public.video_history;
create policy "public read video history" on public.video_history for select to anon, authenticated using (true);
drop policy if exists "public write video history" on public.video_history;
create policy "public write video history" on public.video_history for all to anon, authenticated using (true) with check (true);

-- Enable realtime for the tables used by the dashboard.
alter table public.content_videos replica identity full;
alter table public.deliveries replica identity full;
alter table public.video_statuses replica identity full;
alter table public.validation_options replica identity full;
alter table public.video_history replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.content_videos;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.deliveries;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.video_statuses;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.validation_options;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.video_history;
exception when duplicate_object then null;
end $$;

-- Optional seed for the four demo videos. Existing IDs are preserved.
insert into public.content_videos (id, title, status, attract, brand, connect, direct) values
  ('R9Z3tYW616Y', 'Vídeo 1', 'Em análise', 'Forte gancho inicial', 'Marca tardia (>5s)', 'Humano e próximo', 'CTA pouco evidente'),
  ('u3UvBUofAk', 'Vídeo 2', 'Aprovado', 'Visual dinâmico', 'Uso em contexto', 'Formato UGC natural', 'Texto fora de safe zone'),
  ('nWd7isSaOQ', 'Vídeo 3', 'Ajustes', 'Ritmo oscila no meio', 'Faltar ver + ouvir marca', 'Olhar direto na lente', 'CTA genérico sem incentivo'),
  ('4KAnf4EdE4', 'Vídeo 4', 'Reprovado', 'Arco tradicional lento', 'Marca central na história', 'Tom confiável e direto', 'Comando claro ao final')
on conflict (id) do nothing;
