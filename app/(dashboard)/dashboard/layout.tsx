import Link from 'next/link';
import { signOut } from '@/app/auth/actions';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link className="text-lg font-semibold" href="/dashboard">
              Store Dashboard
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link className="hover:text-slate-900" href="/dashboard/stores">
                Stores
              </Link>
              <Link className="hover:text-slate-900" href="/dashboard/products">
                Products
              </Link>
              <Link className="hover:text-slate-900" href="/dashboard/orders">
                Orders
              </Link>
              <Link className="hover:text-slate-900" href="/dashboard/inventory">
                Inventory
              </Link>
              <Link className="hover:text-slate-900" href="/dashboard/analytics">
                Analytics
              </Link>
            </nav>
          </div>
          <form action={signOut}>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
