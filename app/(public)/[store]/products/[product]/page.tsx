import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProductDetailPage({
  params
}: {
  params: { store: string; product: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', params.store)
    .single();

  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, price, currency, slug')
    .eq('store_id', store?.id ?? '')
    .eq('slug', params.product)
    .single();

  return (
    <main className="container py-10">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold">{product?.name}</h1>
        <p className="text-lg text-slate-600">
          {product?.currency} {product?.price}
        </p>
        <p className="text-slate-700">
          {product?.description ?? 'No description provided.'}
        </p>
        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Add to cart
        </button>
      </div>
    </main>
  );
}
