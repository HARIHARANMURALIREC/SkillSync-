export default function AppPreview() {
  return (
    <div className="card-glass p-5">
      <p className="section-label mb-4">Dashboard</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {['Assessments 4', 'Avg 7.2', 'Path 40%', 'Gaps 2'].map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-elev p-3 text-xs text-muted">
            {s}
          </div>
        ))}
      </div>
      <div className="h-24 rounded-2xl border border-line bg-elev" />
      <p className="mt-3 text-xs text-faint">Career readiness 62%</p>
    </div>
  );
}
