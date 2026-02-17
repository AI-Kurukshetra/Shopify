'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCart } from '@/components/storefront/cart-provider';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function CartDrawer({ storeSlug }: { storeSlug: string }) {
  const { getItems, updateQuantity, removeItem, clearStore, isOpen, close } = useCart();
  const items = getItems(storeSlug);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close cart"
        onClick={close}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        </div>

        <div className="mt-6 flex h-[calc(100%-6rem)] flex-col gap-4">
          <div className="flex-1 space-y-3 overflow-auto pr-2">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">
                    {formatCurrency(item.price)} each
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        className="px-3 py-1 text-sm"
                        onClick={() => updateQuantity(storeSlug, item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="px-3 py-1 text-sm"
                        onClick={() => updateQuantity(storeSlug, item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(storeSlug, item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                Your cart is empty.
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Button asChild className="w-full" disabled={!items.length}>
              <Link href={`/${storeSlug}/checkout`} onClick={close}>
                Proceed to checkout
              </Link>
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => clearStore(storeSlug)}>
              Clear cart
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
