'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/storefront/cart-provider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function CheckoutClient({ storeSlug }: { storeSlug: string }) {
  const { getItems, clearStore } = useCart();
  const items = getItems(storeSlug);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<null | { id: string; email?: string | null }>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState(items);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const guestEmailError = !user && !guestEmail.trim() ? 'Email is required.' : undefined;
  const summaryItems = orderId ? orderItems : items;
  const summaryTotal = summaryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!orderId) {
      setOrderItems(items);
    }
  }, [items, orderId]);

  const handleCheckout = async () => {
    setError(null);
    setSuccess(null);
    setPaymentError(null);
    const isGuest = !user;
    if (isGuest && !guestEmail.trim()) {
      setError('Please enter your email to place an order.');
      return;
    }
    setLoading(true);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeSlug,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        guest: !user
          ? {
              email: guestEmail.trim(),
              fullName: guestName.trim(),
              phone: guestPhone.trim()
            }
          : null
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Checkout failed');
      return;
    }

    setOrderId(data.orderId ?? null);
    setOrderItems(items);
    clearStore(storeSlug);
    setSuccess('Order created! Proceed to payment.');
  };

  const handlePayment = async () => {
    if (!orderId) return;
    setPaymentError(null);
    setPaymentLoading(true);

    const origin = window.location.origin;
    const lineItems = summaryItems.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name
        }
      },
      quantity: item.quantity
    }));

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lineItems,
        successUrl: `${origin}/${storeSlug}/checkout?success=1&order=${orderId}`,
        cancelUrl: `${origin}/${storeSlug}/checkout?canceled=1&order=${orderId}`,
        customerEmail: user?.email ?? guestEmail.trim(),
        orderId
      })
    });

    const data = await response.json();
    setPaymentLoading(false);

    if (!response.ok || !data?.url) {
      setPaymentError(data.error ?? 'Unable to start payment.');
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="error" title="Checkout failed">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" title="Order created">
          {success}
        </Alert>
      ) : null}
      {paymentError ? (
        <Alert variant="error" title="Payment failed">
          {paymentError}
        </Alert>
      ) : null}
      {!authLoading && !user ? (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Guest checkout</p>
            <p className="text-xs text-muted-foreground">
              Enter your contact details to receive order updates.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              label="Email"
              htmlFor="guest-email"
              error={guestEmailError}
            >
              <Input
                id="guest-email"
                name="guest-email"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
            </FormField>
            <FormField label="Full name" htmlFor="guest-name">
              <Input
                id="guest-name"
                name="guest-name"
                placeholder="Jane Doe"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
            </FormField>
            <FormField label="Phone (optional)" htmlFor="guest-phone">
              <Input
                id="guest-phone"
                name="guest-phone"
                placeholder="+1 555 123 9876"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
            </FormField>
          </div>
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              className="font-semibold text-primary hover:text-primary/80"
              href={`/auth/login?redirect=/${storeSlug}/checkout`}
            >
              Sign in
            </Link>{' '}
            for faster checkout.
          </p>
        </div>
      ) : null}
      <div className="space-y-2 text-sm">
        {summaryItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span>{item.name}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(summaryTotal)}</span>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={!items.length || (!user && !guestEmail.trim()) || Boolean(orderId)}
        isLoading={loading}
      >
        Place order
      </Button>
      {orderId ? (
        <Button
          className="w-full"
          variant="secondary"
          onClick={handlePayment}
          isLoading={paymentLoading}
        >
          Proceed to payment
        </Button>
      ) : null}
    </div>
  );
}
