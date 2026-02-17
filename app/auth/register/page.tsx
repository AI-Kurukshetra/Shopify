import Link from 'next/link';
import { signUp } from '../actions';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { error?: string; message?: string };
}) {
  const hasError = Boolean(searchParams?.error);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-soft">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Create a store
              </p>
              <h1 className="text-2xl font-semibold">Launch your storefront</h1>
              <p className="text-sm text-slate-500">
                Set up a new account in minutes.
              </p>
            </div>
            {searchParams?.error ? (
              <Alert variant="error" title="Registration failed">
                {searchParams.error}
              </Alert>
            ) : null}
            {searchParams?.message ? (
              <Alert variant="success" title="Success">
                {searchParams.message}
              </Alert>
            ) : null}
            <form className="space-y-4" action={signUp}>
              <FormField label="Full name" htmlFor="full_name">
                <Input id="full_name" name="full_name" type="text" required />
              </FormField>
              <FormField
                label="Email"
                htmlFor="email"
                error={hasError ? 'Enter a valid email address.' : undefined}
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  hasError={hasError}
                />
              </FormField>
              <FormField
                label="Password"
                htmlFor="password"
                hint="Use at least 8 characters."
                error={hasError ? 'Check your password and try again.' : undefined}
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  hasError={hasError}
                />
              </FormField>
              <SubmitButton className="w-full">Create account</SubmitButton>
            </form>
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link className="font-semibold text-primary hover:text-primary/80" href="/auth/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
