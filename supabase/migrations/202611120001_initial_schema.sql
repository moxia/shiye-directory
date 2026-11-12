-- SHIYE / 拾页 initial schema
-- Run with Supabase CLI or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_zh text not null,
  name_en text not null,
  description_zh text not null,
  description_en text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name_zh text not null,
  name_en text not null,
  description_zh text not null,
  description_en text not null,
  url text not null unique check (url ~ '^https?://'),
  icon_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  site_name_zh text not null,
  site_name_en text not null,
  tagline_zh text not null,
  tagline_en text not null,
  intro_zh text not null,
  intro_en text not null,
  seo_title_zh text not null,
  seo_title_en text not null,
  seo_description_zh text not null,
  seo_description_en text not null,
  footer_text_zh text not null,
  footer_text_en text not null,
  updated_at timestamptz not null default now()
);

create index categories_sort_idx on public.categories (sort_order, id);
create index categories_visible_sort_idx on public.categories (is_visible, sort_order);
create index sites_category_sort_idx on public.sites (category_id, sort_order, id);
create index sites_visible_category_sort_idx on public.sites (category_id, is_visible, sort_order);
create index sites_featured_idx on public.sites (is_featured) where is_featured = true;
create index sites_updated_at_idx on public.sites (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger sites_set_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.sites enable row level security;
alter table public.site_settings enable row level security;

create policy "public reads visible categories"
on public.categories for select
to anon, authenticated
using (is_visible or public.is_admin());

create policy "admin inserts categories"
on public.categories for insert
to authenticated
with check (public.is_admin());

create policy "admin updates categories"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin deletes categories"
on public.categories for delete
to authenticated
using (public.is_admin());

create policy "public reads visible sites"
on public.sites for select
to anon, authenticated
using (
  public.is_admin()
  or (
    is_visible
    and exists (
      select 1 from public.categories c
      where c.id = sites.category_id and c.is_visible
    )
  )
);

create policy "admin inserts sites"
on public.sites for insert
to authenticated
with check (public.is_admin());

create policy "admin updates sites"
on public.sites for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin deletes sites"
on public.sites for delete
to authenticated
using (public.is_admin());

create policy "public reads settings"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "admin inserts settings"
on public.site_settings for insert
to authenticated
with check (public.is_admin());

create policy "admin updates settings"
on public.site_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin deletes settings"
on public.site_settings for delete
to authenticated
using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.sites, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.sites, public.site_settings to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.reorder_categories(p_category_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if coalesce(array_length(p_category_ids, 1), 0) <> (select count(*) from public.categories)
     or (select count(distinct value) from unnest(p_category_ids) as value) <> coalesce(array_length(p_category_ids, 1), 0)
     or exists (
       select 1
       from unnest(p_category_ids) as requested(id)
       left join public.categories category on category.id = requested.id
       where category.id is null
     ) then
    raise exception 'Category order must contain every category exactly once';
  end if;

  update public.categories as category
  set sort_order = ordered.position::integer * 10
  from unnest(p_category_ids) with ordinality as ordered(id, position)
  where category.id = ordered.id;
end;
$$;

create or replace function public.reorder_sites(p_category_id uuid, p_site_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if coalesce(array_length(p_site_ids, 1), 0) <>
       (select count(*) from public.sites where category_id = p_category_id)
     or (select count(distinct value) from unnest(p_site_ids) as value) <>
       coalesce(array_length(p_site_ids, 1), 0)
     or exists (
       select 1
       from unnest(p_site_ids) as requested(id)
       left join public.sites site on site.id = requested.id
       where site.id is null or site.category_id <> p_category_id
     ) then
    raise exception 'Site order must contain every site in the category exactly once';
  end if;

  update public.sites as site
  set sort_order = ordered.position::integer * 10
  from unnest(p_site_ids) with ordinality as ordered(id, position)
  where site.id = ordered.id;
end;
$$;

create or replace function public.import_catalog(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_item jsonb;
  site_item jsonb;
  category_id_value uuid;
  site_id_value uuid;
  normalized_url text;
  categories_created integer := 0;
  categories_updated integer := 0;
  sites_created integer := 0;
  sites_updated integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Import payload must be a JSON object';
  end if;
  if p_payload ->> 'version' <> '1' then
    raise exception 'Unsupported import version';
  end if;
  if jsonb_typeof(p_payload -> 'categories') <> 'array'
     or jsonb_typeof(p_payload -> 'sites') <> 'array' then
    raise exception 'Categories and sites must be arrays';
  end if;
  if jsonb_array_length(p_payload -> 'categories') > 100
     or jsonb_array_length(p_payload -> 'sites') > 500 then
    raise exception 'Import exceeds record limits';
  end if;

  for category_item in
    select value from jsonb_array_elements(p_payload -> 'categories')
  loop
    select id into category_id_value
    from public.categories
    where slug = category_item ->> 'slug';

    if category_id_value is null then
      insert into public.categories (
        slug, name_zh, name_en, description_zh, description_en,
        sort_order, is_visible
      ) values (
        category_item ->> 'slug',
        category_item -> 'name' ->> 'zh',
        category_item -> 'name' ->> 'en',
        category_item -> 'description' ->> 'zh',
        category_item -> 'description' ->> 'en',
        coalesce((category_item ->> 'order')::integer, 0),
        coalesce((category_item ->> 'visible')::boolean, true)
      )
      returning id into category_id_value;
      categories_created := categories_created + 1;
    else
      update public.categories
      set
        name_zh = category_item -> 'name' ->> 'zh',
        name_en = category_item -> 'name' ->> 'en',
        description_zh = category_item -> 'description' ->> 'zh',
        description_en = category_item -> 'description' ->> 'en',
        sort_order = coalesce((category_item ->> 'order')::integer, sort_order),
        is_visible = coalesce((category_item ->> 'visible')::boolean, is_visible)
      where id = category_id_value;
      categories_updated := categories_updated + 1;
    end if;
  end loop;

  for site_item in
    select value from jsonb_array_elements(p_payload -> 'sites')
  loop
    select id into category_id_value
    from public.categories
    where slug = site_item ->> 'categorySlug';

    if category_id_value is null then
      raise exception 'Unknown category slug: %', site_item ->> 'categorySlug';
    end if;

    normalized_url := regexp_replace(btrim(site_item ->> 'url'), '/+$', '');
    select id into site_id_value
    from public.sites
    where regexp_replace(url, '/+$', '') = normalized_url
    limit 1;

    if site_id_value is null then
      insert into public.sites (
        category_id, name_zh, name_en, description_zh, description_en,
        url, icon_url, sort_order, is_visible, is_featured
      ) values (
        category_id_value,
        site_item -> 'name' ->> 'zh',
        site_item -> 'name' ->> 'en',
        site_item -> 'description' ->> 'zh',
        site_item -> 'description' ->> 'en',
        normalized_url,
        nullif(btrim(site_item ->> 'iconUrl'), ''),
        coalesce((site_item ->> 'order')::integer, 0),
        coalesce((site_item ->> 'visible')::boolean, true),
        coalesce((site_item ->> 'featured')::boolean, false)
      );
      sites_created := sites_created + 1;
    else
      update public.sites
      set
        category_id = category_id_value,
        name_zh = site_item -> 'name' ->> 'zh',
        name_en = site_item -> 'name' ->> 'en',
        description_zh = site_item -> 'description' ->> 'zh',
        description_en = site_item -> 'description' ->> 'en',
        url = normalized_url,
        icon_url = nullif(btrim(site_item ->> 'iconUrl'), ''),
        sort_order = coalesce((site_item ->> 'order')::integer, sort_order),
        is_visible = coalesce((site_item ->> 'visible')::boolean, is_visible),
        is_featured = coalesce((site_item ->> 'featured')::boolean, is_featured)
      where id = site_id_value;
      sites_updated := sites_updated + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'categoriesCreated', categories_created,
    'categoriesUpdated', categories_updated,
    'sitesCreated', sites_created,
    'sitesUpdated', sites_updated
  );
end;
$$;

revoke all on function public.reorder_categories(uuid[]) from public, anon;
revoke all on function public.reorder_sites(uuid, uuid[]) from public, anon;
revoke all on function public.import_catalog(jsonb) from public, anon;
grant execute on function public.reorder_categories(uuid[]) to authenticated;
grant execute on function public.reorder_sites(uuid, uuid[]) to authenticated;
grant execute on function public.import_catalog(jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-icons',
  'site-icons',
  true,
  524288,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads site icons"
on storage.objects for select
to public
using (bucket_id = 'site-icons');

create policy "admin inserts site icons"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-icons' and public.is_admin());

create policy "admin updates site icons"
on storage.objects for update
to authenticated
using (bucket_id = 'site-icons' and public.is_admin())
with check (bucket_id = 'site-icons' and public.is_admin());

create policy "admin deletes site icons"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-icons' and public.is_admin());
