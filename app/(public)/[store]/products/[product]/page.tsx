import { createSupabasePublicClient } from '@/lib/supabase/public';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { unstable_noStore as noStore } from 'next/cache';
import { ProductImage } from '@/components/storefront/product-image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ store: string; product: string }>;
}) {
  const { store: storeSlug, product: productSlug } = await params;
  noStore();
  const supabase = createSupabasePublicClient();

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', storeSlug)
    .maybeSingle();

  const { data: product, error: productError } = store?.id
    ? await supabase
        .from('products')
        .select('id, name, description, price, currency, slug, product_images(url)')
        .eq('store_id', store.id)
        .eq('slug', productSlug)
        .maybeSingle()
    : { data: null, error: null };

  return (
    <main className="container py-10">
      {!store ? (
        <Alert variant="error" title="Store not found">
          {storeError?.message ??
            'We could not find this store. Check the URL or store visibility.'}
        </Alert>
      ) : null}
      {!product && store ? (
        <Alert variant="warning" title="Product not found">
          {productError?.message ?? 'This product may be unpublished or removed.'}
        </Alert>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage
          className="aspect-[4/3] w-full rounded-3xl"
          src={product?.product_images?.[0]?.url ?? null}
          alt={product?.name ?? 'Product image'}
          seed={product?.id ?? productSlug}
        />
        <div className="space-y-5">
          <div className="space-y-2">
            <Badge>Featured</Badge>
            <h1 className="text-3xl font-semibold">{product?.name}</h1>
            <p className="text-lg text-slate-600">
              {product?.currency} {product?.price}
            </p>
          </div>
          <p className="text-slate-700">
            {product?.description ?? 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {product && store?.id ? (
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
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50">
              Save for later
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Free shipping on orders over $50. Ships in 2-4 business days.
          </div>
        </div>
      </div>
    </main>
  );
}
