import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const cwd = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(cwd, '.env.local'));
loadEnvFile(path.join(cwd, '.env'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const storeSlugArg = args.find((arg) => arg.startsWith('--store='));
const storeSlug = storeSlugArg ? storeSlugArg.split('=')[1] : (process.env.SEED_STORE_SLUG || 'demo-store');
const ownerEmail = process.env.SEED_OWNER_EMAIL || `owner+${storeSlug}@example.com`;
const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'Password123!';
const seedTag = process.env.SEED_TAG || 'seed';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureOwner() {
  const { data: existing } = await supabase.auth.admin.getUserByEmail(ownerEmail);
  if (existing?.user) return existing.user;

  const { data, error } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { full_name: faker.person.fullName() }
  });

  if (error) throw error;
  return data.user;
}

async function getOrCreateUser(email) {
  const { data: existing } = await supabase.auth.admin.getUserByEmail(email);
  if (existing?.user) return existing.user;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: faker.person.fullName() }
  });

  if (error) throw error;
  return data.user;
}

async function ensurePublicUser(user) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: user.id, email: user.email, full_name: user.user_metadata?.full_name || '' })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

async function ensureStore(ownerId) {
  const { data: existing } = await supabase
    .from('stores')
    .select('id, slug, name')
    .eq('slug', storeSlug)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('stores')
    .insert({
      owner_id: ownerId,
      name: faker.company.name(),
      slug: storeSlug,
      description: faker.company.catchPhrase(),
      is_public: true
    })
    .select('id, slug, name')
    .single();

  if (error) throw error;
  return data;
}

async function ensureStoreMember(storeId, ownerId) {
  const { error } = await supabase
    .from('store_members')
    .upsert({ store_id: storeId, user_id: ownerId, role: 'store_owner' });
  if (error) throw error;
}

async function clearStoreData(storeId) {
  await supabase.from('orders').delete().eq('store_id', storeId);
  await supabase.from('products').delete().eq('store_id', storeId);
  await supabase.from('categories').delete().eq('store_id', storeId);
  await supabase.from('customers').delete().eq('store_id', storeId);
  await supabase.from('subscriptions').delete().eq('store_id', storeId);
}

function randomStatus() {
  const statuses = ['paid', 'pending', 'fulfilled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

async function seed() {
  const owner = await ensureOwner();
  await ensurePublicUser(owner);
  const store = await ensureStore(owner.id);
  await ensureStoreMember(store.id, owner.id);

  if (reset) {
    await clearStoreData(store.id);
  }

  const categoryNames = [
    'Apparel',
    'Electronics',
    'Workspace',
    'Home',
    'Outdoors',
    'Accessories',
    'Wellness',
    'Books',
    'Kitchen',
    'Travel'
  ];

  const { data: categories } = await supabase
    .from('categories')
    .upsert(
      categoryNames.map((name) => ({
        store_id: store.id,
        name,
        slug: slugify(name)
      })),
      { onConflict: 'store_id,slug' }
    )
    .select('id, name, slug');

  const productsPayload = Array.from({ length: 50 }).map(() => {
    const name = faker.commerce.productName();
    return {
      store_id: store.id,
      name,
      slug: slugify(`${name}-${faker.string.alphanumeric(4)}`),
      description: `${faker.commerce.productDescription()} ${faker.company.catchPhrase()}`,
      price: Number(faker.commerce.price({ min: 12, max: 420, dec: 2 })),
      currency: 'USD',
      status: 'active'
    };
  });

  const { data: products } = await supabase
    .from('products')
    .insert(productsPayload)
    .select('id, name, slug, price, currency');

  const productCategories = [];
  const productImages = [];
  const inventoryRows = [];

  for (const product of products ?? []) {
    const categoryCount = faker.number.int({ min: 1, max: 2 });
    const selectedCategories = faker.helpers.arrayElements(categories ?? [], categoryCount);
    for (const category of selectedCategories) {
      productCategories.push({ product_id: product.id, category_id: category.id });
    }

    const imageCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < imageCount; i += 1) {
      productImages.push({
        product_id: product.id,
        path: `${store.id}/${product.id}/${i + 1}.jpg`,
        url: `https://picsum.photos/seed/${product.slug}-${i}/900/700`,
        sort_order: i
      });
    }

    const skuCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < skuCount; i += 1) {
      inventoryRows.push({
        product_id: product.id,
        sku: `${product.slug.slice(0, 8).toUpperCase()}-${i + 1}`,
        quantity: faker.number.int({ min: 5, max: 120 }),
        reserved: faker.number.int({ min: 0, max: 5 })
      });
    }
  }

  if (productCategories.length) {
    await supabase.from('product_categories').insert(productCategories);
  }
  if (productImages.length) {
    await supabase.from('product_images').insert(productImages);
  }
  if (inventoryRows.length) {
    await supabase.from('inventory').insert(inventoryRows);
  }

  const customerUsers = [];
  for (let i = 0; i < 10; i += 1) {
    const email = `customer+${seedTag}${i}@example.com`;
    const user = await getOrCreateUser(email);
    if (user) {
      customerUsers.push(user);
      await ensurePublicUser(user);
    }
  }

  const customersPayload = Array.from({ length: 20 }).map((_, index) => {
    const user = customerUsers[index] ?? null;
    const fullName = user?.user_metadata?.full_name || faker.person.fullName();
    const email = user?.email || `guest+${seedTag}${index}@example.com`;
    return {
      store_id: store.id,
      user_id: user?.id ?? null,
      email,
      full_name: fullName,
      phone: faker.phone.number()
    };
  });

  const { data: customers } = await supabase
    .from('customers')
    .insert(customersPayload)
    .select('id');

  const ordersPayload = [];
  const orderItemsPayload = [];
  const paymentsPayload = [];

  for (let i = 0; i < 50; i += 1) {
    const orderId = crypto.randomUUID();
    const customer = faker.helpers.arrayElement(customers ?? []);
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const items = faker.helpers.arrayElements(products ?? [], itemCount);
    let total = 0;

    for (const item of items) {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const lineTotal = Number(item.price) * quantity;
      total += lineTotal;
      orderItemsPayload.push({
        order_id: orderId,
        product_id: item.id,
        quantity,
        unit_price: item.price,
        total: lineTotal
      });
    }

    const status = randomStatus();
    const paymentStatus = status === 'paid' || status === 'fulfilled' ? 'succeeded' : 'pending';

    ordersPayload.push({
      id: orderId,
      store_id: store.id,
      customer_id: customer?.id ?? null,
      order_number: `ORD-${String(1000 + i)}`,
      status,
      payment_status: paymentStatus,
      total,
      currency: 'USD'
    });

    paymentsPayload.push({
      order_id: orderId,
      provider: 'stripe',
      status: paymentStatus,
      amount: total,
      currency: 'USD',
      raw: { seed: true }
    });
  }

  await supabase.from('orders').insert(ordersPayload);
  await supabase.from('order_items').insert(orderItemsPayload);
  await supabase.from('payments').insert(paymentsPayload);

  await supabase.from('subscriptions').upsert({
    store_id: store.id,
    owner_id: owner.id,
    status: 'active',
    stripe_customer_id: `cus_${faker.string.alphanumeric(10)}`,
    stripe_subscription_id: `sub_${faker.string.alphanumeric(10)}`
  });

  console.log(`Seed complete for store: ${store.slug} (${store.id})`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
