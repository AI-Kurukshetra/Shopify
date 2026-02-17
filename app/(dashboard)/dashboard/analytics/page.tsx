import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: stores } = await supabase.from('stores').select('id');
  const storeIds = stores?.map((store) => store.id) ?? [];

  if (!storeIds.length) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted">
            Basic insights for your storefront.
          </p>
        </header>
        <Alert variant="warning" title="No stores found">
          Create a store to start tracking analytics.
        </Alert>
      </section>
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('store_id', storeIds);

  const { count: dailyOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('store_id', storeIds)
    .gte('created_at', startOfDay.toISOString());

  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .in('store_id', storeIds);

  type OrderItemRow = {
    product_id: string | null;
    quantity: number | null;
    product?: { name: string } | { name: string }[] | null;
  };

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity, product:products(name)')
    .limit(500);

  const topProduct = (() => {
    if (!orderItems?.length) return null;
    const totals = new Map();
    for (const item of orderItems as OrderItemRow[]) {
      if (!item.product_id) continue;
      const productName = Array.isArray(item.product)
        ? item.product[0]?.name
        : item.product?.name;
      const current = totals.get(item.product_id) ?? {
        quantity: 0,
        name: productName ?? 'Product'
      };
      totals.set(item.product_id, {
        quantity: current.quantity + (item.quantity ?? 0),
        name: current.name
      });
    }
    let best = null;
    for (const entry of totals.values()) {
      if (!best || entry.quantity > best.quantity) {
        best = entry;
      }
    }
    return best;
  })();

  const conversionRate =
    totalCustomers && totalOrders
      ? ((totalOrders / totalCustomers) * 100).toFixed(1)
      : '0.0';

  const stats = [
    { label: 'Daily visits', value: dailyOrders ?? 0 },
    { label: 'Conversion rate', value: `${conversionRate}%` },
    { label: 'Top product', value: topProduct?.name ?? 'No data yet' }
  ];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted">
          Basic insights for your storefront.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
