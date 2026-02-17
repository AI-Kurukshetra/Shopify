import './globals.css';
import type { Metadata } from 'next';
import { Manrope, DM_Serif_Display } from 'next/font/google';
import { ClientProviders } from '@/components/providers';
import { ThemeToggle } from '@/components/theme-toggle';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Multi-Store Commerce',
  description: 'Multi-tenant ecommerce platform for independent stores.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ClientProviders>
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
