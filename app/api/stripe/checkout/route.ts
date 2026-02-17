import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineItems, successUrl, cancelUrl, customerEmail, orderId } = body;

    if (!Array.isArray(lineItems) || !lineItems.length) {
      return NextResponse.json({ error: 'Missing line items.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: orderId ?? undefined,
      metadata: orderId ? { order_id: orderId } : undefined
    });

    if (orderId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin
        .from('orders')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', orderId);

      await supabaseAdmin
        .from('payments')
        .update({
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          raw: session
        })
        .eq('order_id', orderId);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
