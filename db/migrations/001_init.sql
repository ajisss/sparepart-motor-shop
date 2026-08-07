create table if not exists categories (
  id       text primary key,
  slug     text unique not null,
  name     text not null,
  position int  not null default 0
);

create table if not exists products (
  id             text primary key,
  sku            text unique not null,
  name           text not null,
  slug           text not null,
  brand          text,
  category_id    text references categories(id),
  price          int  not null,
  description    text,
  video_url      text,
  published      boolean not null default true,
  is_featured    boolean not null default false,
  featured_order int,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx on products (category_id);
create index if not exists products_published_idx on products (published);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  url        text not null,
  position   int  not null default 0
);
create index if not exists product_images_product_idx on product_images (product_id);

create table if not exists product_compatibility (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  model      text not null
);
create index if not exists product_compat_product_idx on product_compatibility (product_id);
