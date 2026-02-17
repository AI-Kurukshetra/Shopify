import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/forms/product-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteProduct } from './actions';

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: { store?: string };
}) {
  const supabase = await createSupabaseServerClient();

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug')
    .order('created_at', { ascending: true });

  const activeStoreId = searchParams?.store ?? stores?.[0]?.id;

  const { data: products } = activeStoreId
    ? await supabase
        .from('products')
        .select('id, name, price, currency, status')
        .eq('store_id', activeStoreId)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-slate-600">
          Manage catalog items for your store.
        </p>
      </header>

      {stores?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Create product</CardTitle>
          </CardHeader>
          <CardContent>
            {activeStoreId ? <ProductForm storeId={activeStoreId} /> : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-sm text-slate-600">
            Create a store first to manage products.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {products?.length ? (
            products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.currency} {product.price}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                    {product.status}
                  </Badge>
                  <form action={deleteProduct}>
                    <input type="hidden" name="product_id" value={product.id} />
                    <Button variant="ghost" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No products yet. Add your first product above.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
