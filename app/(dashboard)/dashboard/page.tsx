import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-600">
          {user?.email ?? 'Signed in'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {['Revenue', 'Orders', 'Active products'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        ))}
      </div>
    </section>
  );
}
