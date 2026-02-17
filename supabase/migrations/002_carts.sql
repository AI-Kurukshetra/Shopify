create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  customer_id uuid not null references public.customers on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, customer_id, status)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index if not exists carts_store_id_idx on public.carts (store_id);
create index if not exists carts_customer_id_idx on public.carts (customer_id);
create index if not exists cart_items_cart_id_idx on public.cart_items (cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

create trigger set_updated_at_carts
before update on public.carts
for each row execute procedure public.set_updated_at();
