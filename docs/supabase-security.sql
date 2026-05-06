-- Run this in the Supabase SQL editor for the production database.
-- This script enables RLS, sets read/write policies, and adds the requested indexes.

begin;

create table if not exists public.app_admins (
  email text primary key
);

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_app_admin() to authenticated;

alter table if exists public.projects enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.reviews enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
using (published = true);

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
on public.projects
for all
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
on public.leads
for insert
with check (true);

drop policy if exists "Admins can read leads" on public.leads;
create policy "Admins can read leads"
on public.leads
for select
using (public.is_app_admin());

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
on public.leads
for update
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
on public.leads
for delete
using (public.is_app_admin());

drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews"
on public.reviews
for insert
with check (true);

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
on public.reviews
for select
using (approved = true);

drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
on public.reviews
for all
using (public.is_app_admin())
with check (public.is_app_admin());

create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_published_idx on public.projects (published);
create index if not exists projects_id_idx on public.projects (id);
create index if not exists projects_type_idx on public.projects (type);

commit;

-- Manual step:
-- Populate public.app_admins with the same admin email addresses you keep in ADMIN_EMAILS.
