'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type StoreFormState = {
  error?: string | null;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

const storeSchema = z.object({
  name: z.string().min(2, 'Store name is required.'),
  slug: z.string().min(2, 'Store slug is required.'),
  description: z.string().optional()
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createStore(
  _prevState: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const parsed = storeSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description')
  });

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', success: false };
  }

  const { data: store, error } = await supabase
    .from('stores')
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      slug: slugify(parsed.data.slug),
      description: parsed.data.description
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message, success: false };
  }

  const { error: memberError } = await supabase.from('store_members').insert({
    store_id: store.id,
    user_id: user.id,
    role: 'store_owner'
  });

  if (memberError) {
    return { error: memberError.message, success: false };
  }

  return { error: null, success: true };
}
