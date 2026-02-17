import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { CartLink } from '@/components/storefront/cart-link';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { CartHydrator } from '@/components/storefront/cart-hydrator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: storeSlug } = await params;
  noStore();
  const supabase = createSupabasePublicClient();
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('slug', storeSlug)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link className="text-lg font-semibold tracking-tight" href={`/${storeSlug}`}>
            {store?.name ?? 'Store'}
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link className="rounded-full px-3 py-1.5 hover:bg-surface hover:text-foreground" href={`/${storeSlug}/products`}>
              Products
            </Link>
            <Link className="rounded-full px-3 py-1.5 hover:bg-surface hover:text-foreground" href={`/${storeSlug}/orders`}>
              Orders
            </Link>
            <CartLink storeSlug={storeSlug} />
          </nav>
        </div>
      </header>
      {children}
      <CartHydrator storeSlug={storeSlug} storeId={store?.id} />
      <CartDrawer storeSlug={storeSlug} />
    </div>
  );
}
