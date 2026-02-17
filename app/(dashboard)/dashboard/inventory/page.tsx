import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: inventory } = await supabase
    .from('inventory')
    .select('id, sku, quantity, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(20);

  type InventoryRow = {
    id: string;
    sku: string;
    quantity: number;
    product?: { name: string } | { name: string }[] | null;
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-600">Monitor stock levels.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Stock overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventory?.length ? (
            (inventory as InventoryRow[]).map((item) => {
              const productName = Array.isArray(item.product)
                ? item.product[0]?.name
                : item.product?.name;
              return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{productName ?? 'Product'}</p>
                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                </div>
                <p className="text-sm font-semibold">{item.quantity}</p>
              </div>
            )})
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No inventory items yet.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
