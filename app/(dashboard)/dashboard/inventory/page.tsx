import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function InventoryPage() {
  const supabase = createSupabaseServerClient();
  const { data: inventory } = await supabase
    .from('inventory')
    .select('id, sku, quantity, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-600">Monitor stock levels.</p>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {inventory?.length ? (
          <div className="space-y-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                </div>
                <p className="text-sm font-semibold">{item.quantity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No inventory items yet.</p>
        )}
      </div>
    </section>
  );
}
