'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const productSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.enum(['draft', 'active']).default('draft')
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    store_id: formData.get('store_id'),
    name: formData.get('name'),
    price: formData.get('price'),
    currency: formData.get('currency') ?? 'USD',
    status: formData.get('status') ?? 'draft'
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('products').insert({
    store_id: parsed.data.store_id,
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    price: parsed.data.price,
    currency: parsed.data.currency,
    status: parsed.data.status
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteProduct(formData: FormData) {
  const productId = String(formData.get('product_id') ?? '');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
