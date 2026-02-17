'use client';

import { useCart } from '@/components/storefront/cart-provider';

export function CartLink({ storeSlug }: { storeSlug: string }) {
  const { getItems, open } = useCart();
  const count = getItems(storeSlug).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      className="relative rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-foreground"
      onClick={open}
      type="button"
    >
      Cart
      {count ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}
