import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? '';

  const supabase = await createSupabaseServerClient();
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, slug, is_public')
    .eq('slug', slug)
    .maybeSingle();

  return NextResponse.json({
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    slug,
    store,
    error: error?.message ?? null
  });
}
