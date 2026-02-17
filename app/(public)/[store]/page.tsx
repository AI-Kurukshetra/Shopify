import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { ProductImage } from '@/components/storefront/product-image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoreHomePage({
  params
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: storeSlug } = await params;
  noStore();
  const supabase = createSupabasePublicClient();
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, description')
    .eq('slug', storeSlug)
    .maybeSingle();

  const { data: products, error: productsError } = store?.id
    ? await supabase
        .from('products')
        .select('id, name, price, currency, slug, product_images(url)')
        .eq('store_id', store.id)
        .eq('status', 'active')
        .limit(6)
    : { data: [], error: null };

  return (
    <main className="container py-10">
      <section className="space-y-10">
        {!store ? (
          <Alert variant="error" title="Store not found">
            {storeError?.message ??
              `We could not find this store. Slug: ${storeSlug}.`}
          </Alert>
        ) : null}
        {process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' ? (
          <Alert variant="info" title="Debug">
            storeId: {store?.id ?? 'null'} · error: {storeError?.message ?? 'none'}
          </Alert>
        ) : null}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-200">Featured storefront</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {store?.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200">
            {store?.description ?? 'Welcome to our storefront.'}
          </p>
          <Link
            className="mt-6 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            href={`/${storeSlug}/products`}
          >
            Browse all products
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Popular picks</h2>
            <Link className="text-sm font-semibold text-primary" href={`/${storeSlug}/products`}>
              View all
            </Link>
          </div>
          {storeError ? (
            <Alert variant="error" title="Unable to load store">
              {storeError.message}
            </Alert>
          ) : null}
          {productsError ? (
            <Alert variant="error" title="Unable to load products">
              {productsError.message}
            </Alert>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {products?.length ? (
              products.map((product) => (
                <Card key={product.id} className="group">
                  <CardContent className="space-y-3">
                    <ProductImage
                      className="h-40"
                      src={product.product_images?.[0]?.url ?? null}
                      alt={product.name}
                      seed={product.id}
                    />
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-primary">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {product.currency} {product.price}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link
                        className="text-sm font-semibold text-primary hover:text-primary/80"
                        href={`/${storeSlug}/products/${product.slug}`}
                      >
                        View details
                      </Link>
                      {store?.id ? (
                        <AddToCartButton
                          storeSlug={storeSlug}
                          storeId={store.id}
                          productId={product.id}
                          name={product.name}
                          price={Number(product.price)}
                          slug={product.slug}
                          imageUrl={product.product_images?.[0]?.url ?? null}
                        />
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No products found.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
