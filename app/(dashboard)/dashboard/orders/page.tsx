import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const supabase = createSupabaseServerClient();
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
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {orders?.length ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">Order #{order.order_number}</p>
                  <p className="text-sm text-slate-500">
                    {order.status} · {order.currency} {order.total}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No orders yet.</p>
        )}
      </div>
    </section>
  );
}
