export default function CheckoutPage() {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
        Create a Stripe Checkout session via API and redirect the customer.
      </div>
    </main>
  );
}
