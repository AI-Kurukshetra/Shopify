import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { CheckoutClient } from '@/components/storefront/checkout-client';
import Link from 'next/link';

export default async function CheckoutPage({
  searchParams,
  params
}: {
  searchParams?: Promise<{ error?: string; success?: string; canceled?: string; order?: string }>;
  params: Promise<{ store: string }>;
}) {
  const resolved = await searchParams;
  const { store: storeSlug } = await params;
  const error = resolved?.error;
  const isSuccess = resolved?.success === '1';
  const isCanceled = resolved?.canceled === '1';

  return (
    <main className="container py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Checkout</h1>
            <p className="text-sm text-muted">
              Secure payment powered by Stripe.
            </p>
          </div>
          {error ? (
            <Alert variant="error" title="Checkout failed">
              {error}
            </Alert>
          ) : null}
          {isSuccess ? (
            <Alert variant="success" title="Payment successful">
              Your payment has been processed successfully.
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                  href="/dashboard"
                >
                  Go to dashboard
                </Link>
                <Link
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface"
                  href={`/${storeSlug}/orders`}
                >
                  View order history
                </Link>
                <Link
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface"
                  href={`/${storeSlug}`}
                >
                  Continue shopping
                </Link>
              </div>
            </Alert>
          ) : null}
          {isCanceled ? (
            <Alert variant="warning" title="Payment canceled">
              Your payment was canceled. You can retry checkout at any time.
            </Alert>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Customer details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" placeholder="you@email.com" />
              </FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="First name" htmlFor="first_name">
                  <Input id="first_name" name="first_name" />
                </FormField>
                <FormField label="Last name" htmlFor="last_name">
                  <Input id="last_name" name="last_name" />
                </FormField>
              </div>
              <FormField label="Shipping address" htmlFor="address">
                <Input id="address" name="address" placeholder="123 Main St" />
              </FormField>
            </CardContent>
          </Card>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Your order has been placed and payment was successful.</p>
                  <div className="flex flex-col gap-2">
                    <Link
                      className="rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:bg-surface"
                      href={`/${storeSlug}/orders`}
                    >
                      View order history
                    </Link>
                    <Link
                      className="rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:bg-surface"
                      href={`/${storeSlug}`}
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <CheckoutClient storeSlug={storeSlug} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
