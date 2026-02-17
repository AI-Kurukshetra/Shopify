import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function StoreHomePage({
  params
}: {
  params: { store: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, description')
    .eq('slug', params.store)
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, currency, slug')
    .eq('store_id', store?.id ?? '')
    .eq('status', 'active')
    .limit(6);

  return (
    <main className="container py-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{store?.name}</h1>
          <p className="text-slate-600">
            {store?.description ?? 'Welcome to our storefront.'}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
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
      </section>
    </main>
  );
}
