'use client';

import * as React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartStoreState = {
  storeId?: string;
  items: CartItem[];
};

type CartState = Record<string, CartStoreState>;

type CartContextValue = {
  getItems: (storeSlug: string) => CartItem[];
  addItem: (
    storeSlug: string,
    storeId: string,
    item: Omit<CartItem, 'quantity'>,
    quantity?: number
  ) => void;
  updateQuantity: (storeSlug: string, productId: string, quantity: number) => void;
  removeItem: (storeSlug: string, productId: string) => void;
  clearStore: (storeSlug: string) => void;
  hydrateStore: (storeSlug: string, storeId: string) => Promise<void>;
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'cart:v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>({});
  const [isOpen, setIsOpen] = React.useState(false);
  const [syncSlug, setSyncSlug] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartState;
      setState(parsed ?? {});
    } catch {
      setState({});
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getItems = React.useCallback(
    (storeSlug: string) => state[storeSlug]?.items ?? [],
    [state]
  );

  const ensureCustomer = React.useCallback(
    async (storeId: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return null;

      const { data: customer, error } = await supabase
        .from('customers')
        .upsert(
          {
            store_id: storeId,
            user_id: user.id,
            email: user.email ?? '',
            full_name: user.user_metadata?.full_name ?? ''
          },
          { onConflict: 'store_id,email' }
        )
        .select('id')
        .single();

      if (error) {
        return null;
      }

      return customer;
    },
    [supabase]
  );

  const syncToServer = React.useCallback(
    async (storeSlug: string) => {
      const storeState = state[storeSlug];
      if (!storeState?.storeId) return;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const customer = await ensureCustomer(storeState.storeId);
      if (!customer) return;

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('store_id', storeState.storeId)
        .eq('customer_id', customer.id)
        .eq('status', 'active')
        .maybeSingle();

      const cartId = cart?.id;
      const { data: cartRow, error: cartError } = cartId
        ? { data: cart, error: null }
        : await supabase
            .from('carts')
            .insert({
              store_id: storeState.storeId,
              customer_id: customer.id,
              status: 'active'
            })
            .select('id')
            .single();

      if (cartError || !cartRow) return;

      await supabase.from('cart_items').delete().eq('cart_id', cartRow.id);

      if (!storeState.items.length) return;

      await supabase.from('cart_items').insert(
        storeState.items.map((item) => ({
          cart_id: cartRow.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      );
    },
    [ensureCustomer, state, supabase]
  );

  React.useEffect(() => {
    if (!syncSlug) return;
    syncToServer(syncSlug).finally(() => setSyncSlug(null));
  }, [syncSlug, syncToServer]);

  const hydrateStore = React.useCallback(
    async (storeSlug: string, storeId: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', storeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!customer) return;

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('store_id', storeId)
        .eq('customer_id', customer.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!cart) return;

      const { data: items } = await supabase
        .from('cart_items')
        .select('product_id, quantity, unit_price, product:products(name, slug)')
        .eq('cart_id', cart.id);

      if (!items?.length) return;

      const mapped = items.map((item) => ({
        id: item.product_id,
        name: item.product?.name ?? 'Product',
        slug: item.product?.slug ?? '',
        price: Number(item.unit_price),
        quantity: item.quantity
      }));

      setState((prev) => ({
        ...prev,
        [storeSlug]: {
          storeId,
          items: mapped
        }
      }));
    },
    [supabase]
  );

  const addItem = React.useCallback(
    (storeSlug: string, storeId: string, item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setState((prev) => {
        const current = prev[storeSlug]?.items ?? [];
        const existing = current.find((entry) => entry.id === item.id);
        const updatedItems = existing
          ? current.map((entry) =>
              entry.id === item.id
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry
            )
          : [...current, { ...item, quantity }];

        return {
          ...prev,
          [storeSlug]: {
            storeId,
            items: updatedItems
          }
        };
      });
      setIsOpen(true);
      setSyncSlug(storeSlug);
    },
    []
  );

  const updateQuantity = React.useCallback(
    (storeSlug: string, productId: string, quantity: number) => {
      setState((prev) => {
        const current = prev[storeSlug]?.items ?? [];
        const updatedItems = current
          .map((entry) =>
            entry.id === productId ? { ...entry, quantity: Math.max(1, quantity) } : entry
          )
          .filter((entry) => entry.quantity > 0);

        return {
          ...prev,
          [storeSlug]: {
            storeId: prev[storeSlug]?.storeId,
            items: updatedItems
          }
        };
      });
      setSyncSlug(storeSlug);
    },
    []
  );

  const removeItem = React.useCallback(
    (storeSlug: string, productId: string) => {
      setState((prev) => {
        const current = prev[storeSlug]?.items ?? [];
        return {
          ...prev,
          [storeSlug]: {
            storeId: prev[storeSlug]?.storeId,
            items: current.filter((entry) => entry.id !== productId)
          }
        };
      });
      setSyncSlug(storeSlug);
    },
    []
  );

  const clearStore = React.useCallback(
    (storeSlug: string) => {
      setState((prev) => ({
        ...prev,
        [storeSlug]: {
          storeId: prev[storeSlug]?.storeId,
          items: []
        }
      }));
      setSyncSlug(storeSlug);
    },
    []
  );

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        getItems,
        addItem,
        updateQuantity,
        removeItem,
        clearStore,
        hydrateStore,
        open,
        close,
        isOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
