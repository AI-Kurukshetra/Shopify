'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ProductFormState = {
  error?: string | null;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

const productSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Product name is required.'),
  price: z.coerce.number().min(0, 'Price must be positive.'),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.enum(['draft', 'active']).default('active')
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = productSchema.safeParse({
    store_id: formData.get('store_id'),
    name: formData.get('name'),
    price: formData.get('price'),
    currency: formData.get('currency') ?? 'USD',
    status: formData.get('status') ?? 'draft'
  });

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors
    };
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
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const productId = String(formData.get('product_id') ?? '');
  const supabase = await createSupabaseServerClient();
  await supabase.from('products').delete().eq('id', productId);
}
