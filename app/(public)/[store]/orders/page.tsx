import { createSupabasePublicClient } from '@/lib/supabase/public';
import { OrderHistory } from '@/components/storefront/order-history';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrdersPage({
  params
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: storeSlug } = await params;
  const supabase = createSupabasePublicClient();
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', storeSlug)
    .maybeSingle();

  return (
    <main className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Order history</h1>
          <p className="text-sm text-muted-foreground">
            Review your recent purchases at {store?.name ?? 'this store'}.
          </p>
        </div>
        <OrderHistory storeSlug={storeSlug} storeId={store?.id} />
      </div>
    </main>
  );
}
