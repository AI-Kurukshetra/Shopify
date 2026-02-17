'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total: number;
  product?: { name: string; slug: string } | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
};

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function OrderHistory({
  storeSlug,
  storeId
}: {
  storeSlug: string;
  storeId?: string | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!storeId) {
        setError('Store not found.');
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!active) return;

      if (!user) {
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(
          'id, order_number, status, payment_status, total, currency, created_at, order_items(id, quantity, unit_price, total, product:products(name, slug))'
        )
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (ordersError) {
        setError(ordersError.message);
      } else {
        setOrders((data ?? []) as Order[]);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [storeId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading your orders...
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Alert variant="info" title="Sign in required">
        <span className="text-sm">
          Please{' '}
          <Link
            className="font-semibold text-primary hover:text-primary/80"
            href={`/auth/login?redirect=/${storeSlug}/orders`}
          >
            sign in
          </Link>{' '}
          to view your order history.
        </span>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Unable to load orders">
        {error}
      </Alert>
    );
  }

  if (!orders.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You have not placed any orders yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{order.order_number}</CardTitle>
              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
              <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">
                {order.status}
              </span>
              <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">
                {order.payment_status}
              </span>
              <span className="rounded-full bg-surface px-3 py-1 text-foreground">
                {formatCurrency(Number(order.total), order.currency)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>{item.product?.name ?? 'Product'}</span>
                <span>
                  {item.quantity} × {formatCurrency(Number(item.unit_price), order.currency)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
