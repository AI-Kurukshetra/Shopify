import Link from 'next/link';
import { signOut } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard/stores', label: 'Stores' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/inventory', label: 'Inventory' },
  { href: '/dashboard/analytics', label: 'Analytics' }
];

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <Link className="text-lg font-semibold tracking-tight" href="/dashboard">
              Store Dashboard
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm text-muted">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-full px-3 py-1.5 hover:bg-surface hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={signOut}>
            <Button variant="secondary" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
