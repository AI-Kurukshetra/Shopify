import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createProduct, deleteProduct } from './actions';

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: { store?: string };
}) {
  const supabase = createSupabaseServerClient();

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
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Create product</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-4" action={createProduct}>
            <input type="hidden" name="store_id" value={activeStoreId} />
            <div className="md:col-span-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="name"
                name="name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="price">
                Price
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="status"
                name="status"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            <button
              className="md:col-span-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              type="submit"
            >
              Add product
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          Create a store first to manage products.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Catalog</h2>
        <div className="mt-4 space-y-3">
          {products?.length ? (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.currency} {product.price} · {product.status}
                  </p>
                </div>
                <form action={deleteProduct}>
                  <input type="hidden" name="product_id" value={product.id} />
                  <button
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                    type="submit"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No products yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
