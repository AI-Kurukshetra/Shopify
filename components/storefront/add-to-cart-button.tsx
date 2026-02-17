'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/components/storefront/cart-provider';

export function AddToCartButton({
  storeSlug,
  storeId,
  productId,
  name,
  price,
  slug,
  imageUrl
}: {
  storeSlug: string;
  storeId: string;
  productId: string;
  name: string;
  price: number;
  slug: string;
  imageUrl?: string | null;
}) {
  const { toast } = useToast();
  const { addItem } = useCart();

  return (
    <Button
      onClick={() => {
        addItem(storeSlug, storeId, { id: productId, name, price, slug, imageUrl });
        toast({
          title: 'Added to cart',
          description: `${name} has been added to your cart.`,
          variant: 'success'
        });
      }}
    >
      Add to cart
    </Button>
  );
}
