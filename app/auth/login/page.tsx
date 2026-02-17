import Link from 'next/link';
import { signIn } from '../actions';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string; message?: string; redirect?: string };
}) {
  const hasError = Boolean(searchParams?.error);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-soft">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Store owner access
              </p>
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="text-sm text-slate-500">
                Sign in to manage products, orders, and inventory.
              </p>
            </div>
            {searchParams?.error ? (
              <Alert variant="error" title="Login failed">
                {searchParams.error}
              </Alert>
            ) : null}
            {searchParams?.message ? (
              <Alert variant="success" title="Check your inbox">
                {searchParams.message}
              </Alert>
            ) : null}
            <form className="space-y-4" action={signIn}>
              <input type="hidden" name="redirect_to" value={searchParams?.redirect ?? ''} />
              <FormField
                label="Email"
                htmlFor="email"
                error={hasError ? 'Check your email and try again.' : undefined}
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  hasError={hasError}
                  aria-invalid={hasError}
                />
              </FormField>
              <FormField
                label="Password"
                htmlFor="password"
                error={hasError ? 'Check your password and try again.' : undefined}
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  hasError={hasError}
                  aria-invalid={hasError}
                />
              </FormField>
              <SubmitButton className="w-full">Sign in</SubmitButton>
            </form>
            <p className="text-sm text-slate-500">
              New here?{' '}
              <Link className="font-semibold text-primary hover:text-primary/80" href="/auth/register">
                Create a store
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
