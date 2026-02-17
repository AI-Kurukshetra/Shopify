create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_store_member(store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.store_members
    where store_members.store_id = is_store_member.store_id
      and store_members.user_id = auth.uid()
  );
$$;

create or replace function public.is_store_owner(store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.stores
    where stores.id = is_store_owner.store_id
      and stores.owner_id = auth.uid()
  );
$$;

create or replace function public.is_store_public(store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.stores
    where stores.id = is_store_public.store_id
      and stores.is_public = true
  );
$$;

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Users
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id or public.is_admin());

-- User roles
create policy "Admins manage roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Stores
create policy "Public stores are readable"
  on public.stores for select
  using (is_public = true or public.is_store_member(id) or public.is_admin());

create policy "Store owners can create stores"
  on public.stores for insert
  with check (auth.uid() = owner_id or public.is_admin());

create policy "Store owners can update stores"
  on public.stores for update
  using (public.is_store_owner(id) or public.is_admin());

create policy "Store owners can delete stores"
  on public.stores for delete
  using (public.is_store_owner(id) or public.is_admin());

-- Store members
create policy "Members can view membership"
  on public.store_members for select
  using (user_id = auth.uid() or public.is_store_owner(store_id) or public.is_admin());

create policy "Owners manage members"
  on public.store_members for insert
  with check (public.is_store_owner(store_id) or public.is_admin());

create policy "Owners update members"
  on public.store_members for update
  using (public.is_store_owner(store_id) or public.is_admin());

create policy "Owners remove members"
  on public.store_members for delete
  using (public.is_store_owner(store_id) or public.is_admin());

-- Categories
create policy "Public categories are readable"
  on public.categories for select
  using (public.is_store_public(store_id) or public.is_store_member(store_id) or public.is_admin());

create policy "Store members manage categories"
  on public.categories for all
  using (public.is_store_member(store_id) or public.is_admin())
  with check (public.is_store_member(store_id) or public.is_admin());

-- Products
create policy "Public products are readable"
  on public.products for select
  using (
    (public.is_store_public(store_id) and status = 'active')
    or public.is_store_member(store_id)
    or public.is_admin()
  );

create policy "Store members manage products"
  on public.products for all
  using (public.is_store_member(store_id) or public.is_admin())
  with check (public.is_store_member(store_id) or public.is_admin());

-- Product categories
create policy "Store members manage product categories"
  on public.product_categories for all
  using (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  )
  with check (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  );

-- Product images
create policy "Public product images are readable"
  on public.product_images for select
  using (
    public.is_store_public(
      (select store_id from public.products where id = product_id)
    )
    or public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  );

create policy "Store members manage product images"
  on public.product_images for all
  using (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  )
  with check (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  );

-- Inventory
create policy "Store members manage inventory"
  on public.inventory for all
  using (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  )
  with check (
    public.is_store_member(
      (select store_id from public.products where id = product_id)
    )
    or public.is_admin()
  );

-- Customers
create policy "Customers can view own record"
  on public.customers for select
  using (user_id = auth.uid() or public.is_store_member(store_id) or public.is_admin());

create policy "Authenticated users can create customer"
  on public.customers for insert
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or public.is_store_member(store_id)
    or public.is_admin()
  );

create policy "Customers can update own record"
  on public.customers for update
  using (user_id = auth.uid() or public.is_store_member(store_id) or public.is_admin());

-- Orders
create policy "Orders readable by store members or customer"
  on public.orders for select
  using (
    public.is_store_member(store_id)
    or public.is_admin()
    or exists (
      select 1 from public.customers
      where customers.id = orders.customer_id
        and customers.user_id = auth.uid()
    )
  );

create policy "Customers can create orders"
  on public.orders for insert
  with check (
    exists (
      select 1 from public.customers
      where customers.id = orders.customer_id
        and customers.user_id = auth.uid()
    )
  );

create policy "Store members manage orders"
  on public.orders for all
  using (public.is_store_member(store_id) or public.is_admin())
  with check (public.is_store_member(store_id) or public.is_admin());

-- Order items
create policy "Order items readable by store members or customer"
  on public.order_items for select
  using (
    public.is_store_member(
      (select store_id from public.orders where id = order_id)
    )
    or public.is_admin()
    or exists (
      select 1 from public.customers
      join public.orders on orders.customer_id = customers.id
      where orders.id = order_items.order_id
        and customers.user_id = auth.uid()
    )
  );

create policy "Customers can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      join public.customers on customers.id = orders.customer_id
      where orders.id = order_items.order_id
        and customers.user_id = auth.uid()
    )
  );

create policy "Store members manage order items"
  on public.order_items for all
  using (
    public.is_store_member(
      (select store_id from public.orders where id = order_id)
    )
    or public.is_admin()
  )
  with check (
    public.is_store_member(
      (select store_id from public.orders where id = order_id)
    )
    or public.is_admin()
  );

-- Payments
create policy "Store members manage payments"
  on public.payments for all
  using (
    public.is_store_member(
      (select store_id from public.orders where id = order_id)
    )
    or public.is_admin()
  )
  with check (
    public.is_store_member(
      (select store_id from public.orders where id = order_id)
    )
    or public.is_admin()
  );

create policy "Customers can create payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.orders
      join public.customers on customers.id = orders.customer_id
      where orders.id = payments.order_id
        and customers.user_id = auth.uid()
    )
  );

-- Subscriptions
create policy "Store owners manage subscriptions"
  on public.subscriptions for all
  using (public.is_store_owner(store_id) or public.is_admin())
  with check (public.is_store_owner(store_id) or public.is_admin());

-- Carts
create policy "Customers manage own carts"
  on public.carts for all
  using (
    exists (
      select 1 from public.customers
      where customers.id = carts.customer_id
        and customers.user_id = auth.uid()
    )
    or public.is_store_member(store_id)
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.customers
      where customers.id = carts.customer_id
        and customers.user_id = auth.uid()
    )
    or public.is_store_member(store_id)
    or public.is_admin()
  );

-- Cart items
create policy "Customers manage own cart items"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      join public.customers on customers.id = carts.customer_id
      where carts.id = cart_items.cart_id
        and customers.user_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.carts
      join public.customers on customers.id = carts.customer_id
      where carts.id = cart_items.cart_id
        and customers.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- Storage bucket policies
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Store members manage product images"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and public.is_store_member((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'product-images'
    and public.is_store_member((split_part(name, '/', 1))::uuid)
  );
