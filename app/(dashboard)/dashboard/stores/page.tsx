import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreForm } from '@/components/forms/store-form';
import { Badge } from '@/components/ui/badge';

export default async function StoresPage() {
  const supabase = await createSupabaseServerClient();
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, is_public')
    .order('created_at', { ascending: true });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Stores</h1>
        <p className="text-sm text-slate-600">
          Create and manage your storefronts.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create store</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your stores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stores?.length ? (
            stores.map((store) => (
              <div
                key={store.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-slate-500">/{store.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={store.is_public ? 'success' : 'warning'}>
                    {store.is_public ? 'Public' : 'Private'}
                  </Badge>
                  <Link
                    className="text-sm font-semibold text-primary hover:text-primary/80"
                    href={`/${store.slug}`}
                  >
                    View store
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No stores created yet.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
