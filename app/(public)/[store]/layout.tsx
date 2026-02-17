import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { store: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('slug', params.store)
    .single();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="container flex items-center justify-between py-4">
          <Link className="text-lg font-semibold" href={`/${params.store}`}>
            {store?.name ?? 'Store'}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link className="hover:text-slate-900" href={`/${params.store}/products`}>
              Products
            </Link>
            <Link className="hover:text-slate-900" href={`/${params.store}/cart`}>
              Cart
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
