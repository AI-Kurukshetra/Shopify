import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { ProductImage } from '@/components/storefront/product-image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductListPage({
  params
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: storeSlug } = await params;
  noStore();
  const supabase = createSupabasePublicClient();
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', storeSlug)
    .maybeSingle();

  const { data: products, error: productsError } = store?.id
    ? await supabase
        .from('products')
        .select('id, name, price, currency, slug, product_images(url)')
        .eq('store_id', store.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  return (
    <main className="container py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Catalog</p>
          <h1 className="text-3xl font-semibold">{store?.name} Products</h1>
        </div>
        <p className="text-sm text-slate-500">{products?.length ?? 0} items</p>
      </div>
      {!store ? (
        <Alert variant="error" title="Store not found">
          {storeError?.message ??
            'We could not find this store. Check the URL or store visibility.'}
        </Alert>
      ) : null}
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.length ? (
            products.map((product) => (
              <Card key={product.id} className="group">
                <CardContent className="space-y-4">
                  <ProductImage
                    className="h-44"
                    src={product.product_images?.[0]?.url ?? null}
                    alt={product.name}
                    seed={product.id}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-primary">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {product.currency} {product.price}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      In stock
                    </span>
                  </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    className="inline-flex text-sm font-semibold text-primary hover:text-primary/80"
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
    </main>
  );
}
