import Link from 'next/link';

export default function CartPage({ params }: { params: { store: string } }) {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold">Your cart</h1>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
        Cart state is client-managed. Implement with local storage or a cart table.
      </div>
      <Link
        className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        href={`/${params.store}/checkout`}
      >
        Proceed to checkout
      </Link>
    </main>
  );
}
