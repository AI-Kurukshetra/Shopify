import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container py-20">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Multi-tenant commerce platform
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Launch your own storefront in minutes.
          </h1>
          <p className="text-lg text-slate-600">
            A Shopify-like platform built with Next.js, Supabase, and Stripe.
            Create stores, manage products, and sell with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              href="/auth/register"
            >
              Start a store
            </Link>
            <Link
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400"
              href="/auth/login"
            >
              Store owner login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
