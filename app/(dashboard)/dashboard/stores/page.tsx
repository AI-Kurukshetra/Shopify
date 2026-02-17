import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createStore } from './actions';

export default async function StoresPage() {
  const supabase = createSupabaseServerClient();
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

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Create store</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" action={createStore}>
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              Store name
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="name"
              name="name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="slug">
              Store slug
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="slug"
              name="slug"
              placeholder="acme-shop"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="description"
              name="description"
              rows={3}
            />
          </div>
          <button
            className="md:col-span-2 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            type="submit"
          >
            Create store
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Your stores</h2>
        <div className="mt-4 space-y-3">
          {stores?.length ? (
            stores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-slate-500">/{store.slug}</p>
                </div>
                <Link
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  href={`/${store.slug}`}
                >
                  View store
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No stores created yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
