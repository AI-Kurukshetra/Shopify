import Link from 'next/link';
import { signUp } from '../actions';

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { error?: string; message?: string };
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Create your store</h1>
            <p className="text-sm text-slate-500">
              Sign up to launch a new storefront.
            </p>
          </div>
          {searchParams?.error ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {searchParams.error}
            </p>
          ) : null}
          {searchParams?.message ? (
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
              {searchParams.message}
            </p>
          ) : null}
          <form className="space-y-4" action={signUp}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="full_name">
                Full name
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="full_name"
                name="full_name"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
              />
            </div>
            <button
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              type="submit"
            >
              Create account
            </button>
          </form>
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link className="text-brand-600 hover:text-brand-700" href="/auth/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
