import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object as {
            client_reference_id?: string | null;
            metadata?: { order_id?: string | null } | null;
            payment_intent?: string | null;
            payment_status?: string | null;
          };
          const orderId = session.metadata?.order_id ?? session.client_reference_id ?? null;
          if (orderId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createSupabaseAdminClient();
            await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_status: session.payment_status === 'paid' ? 'succeeded' : 'pending',
                stripe_payment_intent_id: session.payment_intent ?? null
              })
              .eq('id', orderId);

            await supabase
              .from('payments')
              .update({
                status: session.payment_status === 'paid' ? 'succeeded' : 'pending',
                stripe_payment_intent_id: session.payment_intent ?? null,
                raw: session
              })
              .eq('order_id', orderId);
          }
        }
        break;
      case 'customer.subscription.updated':
        // TODO: update store subscription
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
