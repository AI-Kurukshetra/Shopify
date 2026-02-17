'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/storefront/cart-provider';

export function CartHydrator({
  storeSlug,
  storeId
}: {
  storeSlug: string;
  storeId?: string | null;
}) {
  const { hydrateStore } = useCart();

  useEffect(() => {
    if (!storeId) return;
    hydrateStore(storeSlug, storeId);
  }, [hydrateStore, storeId, storeSlug]);

  return null;
}
