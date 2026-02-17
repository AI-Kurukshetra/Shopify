export default function AnalyticsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-slate-600">
          Basic insights for your storefront.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {['Daily visits', 'Conversion rate', 'Top product'].map((label) => (
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
