'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function Error({
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
    <main className="container flex min-h-[60vh] flex-col justify-center gap-6 py-16">
      <Alert variant="error" title="Something went wrong">
        {error.message}
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/')}> 
          Go home
        </Button>
      </div>
    </main>
  );
}
