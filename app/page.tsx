import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <section className="container grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary">
            Multi-tenant commerce platform
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Launch a polished storefront that feels made for your brand.
          </h1>
          <p className="text-lg text-slate-600">
            A Shopify-like platform built with Next.js, Supabase, and Stripe. Create stores,
            manage products, and ship faster with a focused, modern workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/auth/register">Start a store</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/login">Store owner login</Link>
            </Button>
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            {[
              { label: 'Stores', value: 'Multi-tenant' },
              { label: 'Payments', value: 'Stripe' },
              { label: 'Stack', value: 'Next.js + Supabase' }
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="shadow-soft">
          <CardContent className="space-y-6">
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <p className="text-sm text-slate-300">Live preview</p>
              <p className="mt-2 text-2xl font-semibold">Merchant dashboard</p>
              <p className="mt-2 text-sm text-slate-300">
                Track orders, manage inventory, and see what is selling.
              </p>
            </div>
            <div className="grid gap-3">
              {['Create products', 'Manage orders', 'Launch storefronts'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-slate-700"
              >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                {item}
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
