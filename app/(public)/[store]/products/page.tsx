import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProductListPage({
  params
}: {
  params: { store: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', params.store)
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, currency, slug')
    .eq('store_id', store?.id ?? '')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold">{store?.name} Products</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {products?.map((product) => (
          <Link
            key={product.id}
            className="rounded-xl border border-slate-200 p-4 hover:border-brand-600"
            href={`/${params.store}/products/${product.slug}`}
          >
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-slate-600">
              {product.currency} {product.price}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
