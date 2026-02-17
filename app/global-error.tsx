'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optional: log to monitoring service
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="container flex min-h-[60vh] flex-col justify-center gap-6 py-16">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <h1 className="text-2xl font-semibold">Unexpected error</h1>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/')}> 
              Go home
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
