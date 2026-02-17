import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { storeSlug, items: payloadItems, guest } = await request.json();
    if (!storeSlug) {
      return NextResponse.json({ error: 'Missing store slug.' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration missing service role key.' },
        { status: 500 }
      );
    }

    const client = user ? supabase : createSupabaseAdminClient();

    const { data: store, error: storeError } = await client
      .from('stores')
      .select('id')
      .eq('slug', storeSlug)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    let customer: { id: string } | null = null;
    if (user) {
      const { data: existing } = await client
        .from('customers')
        .select('id')
        .eq('store_id', store.id)
        .eq('user_id', user.id)
        .maybeSingle();
      customer = existing;

      if (!customer) {
        const { data: created, error: customerError } = await client
          .from('customers')
          .insert({
            store_id: store.id,
            user_id: user.id,
            email: user.email ?? '',
            full_name: user.user_metadata?.full_name ?? ''
          })
          .select('id')
          .single();

        if (customerError || !created) {
          return NextResponse.json(
            { error: customerError?.message ?? 'Customer profile missing.' },
            { status: 400 }
          );
        }

        customer = created;
      }
    } else {
      const email = String(guest?.email ?? '').trim().toLowerCase();
      const fullName = String(guest?.fullName ?? '').trim();
      const phone = String(guest?.phone ?? '').trim();

      if (!email) {
        return NextResponse.json({ error: 'Guest email is required.' }, { status: 400 });
      }

      const { data: existing } = await client
        .from('customers')
        .select('id')
        .eq('store_id', store.id)
        .eq('email', email)
        .maybeSingle();

      customer = existing;

      if (!customer) {
        const { data: created, error: customerError } = await client
          .from('customers')
          .insert({
            store_id: store.id,
            email,
            full_name: fullName || null,
            phone: phone || null
          })
          .select('id')
          .single();

        if (customerError || !created) {
          return NextResponse.json(
            { error: customerError?.message ?? 'Customer profile missing.' },
            { status: 400 }
          );
        }

        customer = created;
      }
    }

    const cart = user
      ? await supabase
          .from('carts')
          .select('id')
          .eq('store_id', store.id)
          .eq('customer_id', customer.id)
          .eq('status', 'active')
          .maybeSingle()
      : { data: null };

    const cartItems = cart.data
      ? await supabase
          .from('cart_items')
          .select('product_id, quantity, unit_price')
          .eq('cart_id', cart.data.id)
      : { data: null };

    let items = cartItems.data ?? [];
    if (!items?.length && Array.isArray(payloadItems) && payloadItems.length) {
      const productIds = payloadItems.map((item) => item.productId).filter(Boolean);
      const { data: products } = await client
        .from('products')
        .select('id, price')
        .eq('store_id', store.id)
        .in('id', productIds);

      const priceById = new Map(
        (products ?? []).map((product) => [product.id, Number(product.price)])
      );
      items = payloadItems
        .map((item) => ({
          product_id: item.productId,
          quantity: Number(item.quantity) || 1,
          unit_price: priceById.get(item.productId) ?? null
        }))
        .filter((item) => item.product_id && item.unit_price !== null);
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart has no items.' }, { status: 400 });
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.unit_price) * item.quantity,
      0
    );

    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        store_id: store.id,
        customer_id: customer.id,
        order_number: `ORD-${Date.now()}`,
        status: 'pending',
        payment_status: 'pending',
        total,
        currency: 'USD'
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message ?? 'Order failed.' }, { status: 400 });
    }

    await client.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: Number(item.unit_price) * item.quantity
      }))
    );

    await client
      .from('payments')
      .insert({ order_id: order.id, provider: 'stripe', status: 'pending', amount: total, currency: 'USD' });

    if (cart.data?.id) {
      await supabase.from('carts').update({ status: 'converted' }).eq('id', cart.data.id);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
