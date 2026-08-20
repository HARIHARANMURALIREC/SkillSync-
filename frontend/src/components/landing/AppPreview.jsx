export default function AppPreview() {
  return (
    <div className="card-glass p-5 shadow-neon">
      <p className="section-label mb-4">Dashboard preview</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Assessments', val: '4', tone: 'text-accent' },
          { label: 'Avg score', val: '7.2', tone: 'text-violet' },
          { label: 'Path', val: '40%', tone: 'text-teal' },
          { label: 'High gaps', val: '2', tone: 'text-rose' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-elev p-3">
            <p className="text-xs text-muted">{s.label}</p>
            <p className={`font-mono text-lg font-semibold tabular ${s.tone}`}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="h-24 rounded-lg border border-accent/20 bg-elev relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent" />
        <svg viewBox="0 0 200 60" className="absolute inset-0 h-full w-full p-3">
          <polyline
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth="2"
            points="0,45 40,35 80,40 120,20 160,28 200,10"
          />
        </svg>
      </div>
      <p className="mt-3 text-xs text-faint">Career readiness <span className="text-accent font-mono">62%</span></p>
    </div>
  );
}
