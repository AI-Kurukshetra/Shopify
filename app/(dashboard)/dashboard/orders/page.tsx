import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  fulfilled: { label: 'Fulfilled', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'danger' }
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-slate-600">
          Track recent customer purchases.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Latest orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders?.length ? (
            orders.map((order) => {
              const status = statusMap[order.status] ?? statusMap.pending;
              return (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-slate-500">
                      {order.currency} {order.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No orders yet.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
