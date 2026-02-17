'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCart } from '@/components/storefront/cart-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export default function CartPage({
  params
}: {
  params: { store: string };
}) {
  const { getItems, updateQuantity, removeItem, clearStore } = useCart();
  const items = getItems(params.store);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <main className="container py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Your cart</h1>
            {items.length ? (
              <Button variant="ghost" size="sm" onClick={() => clearStore(params.store)}>
                Clear cart
              </Button>
            ) : null}
          </div>

          <Card>
            <CardContent className="space-y-4">
              {items.length ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          className="px-3 py-1 text-sm"
                          onClick={() => updateQuantity(params.store, item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button
                          className="px-3 py-1 text-sm"
                          onClick={() => updateQuantity(params.store, item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(params.store, item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
                  Your cart is empty.
                </div>
              )}

              {!items.length ? (
                <Alert variant="info" title="Tip">
                  Add items to your cart to see them here.
                </Alert>
              ) : null}

              <Button asChild variant="secondary">
                <Link href={`/${params.store}/products`}>Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button asChild className="w-full" disabled={!items.length}>
                <Link href={`/${params.store}/checkout`}>Proceed to checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
