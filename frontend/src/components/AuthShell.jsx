import NeonMesh from './ui/NeonMesh';

export default function AuthShell({ kicker, title, accent, children, highlights }) {
  return (
    <div className="relative min-h-screen grid lg:grid-cols-[44%_1fr] bg-bg text-fg">
      <div className="relative hidden overflow-hidden lg:block border-r border-line">
        <NeonMesh variant="hero" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <p className="font-display text-2xl font-bold">SkillSync</p>
          <div>
            <p className="page-kicker">{kicker}</p>
            <h1 className="font-display text-5xl font-extrabold leading-tight">
              {title} <span className="text-gradient">{accent}</span>
            </h1>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              {(highlights || ['Scoring stays math.', 'Plans sized to your hours.', 'Mistral runs locally.']).map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-neon-sm" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-faint">Private by default. No cloud model in the loop.</p>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 panel-glow shadow-panel">
          {children}
        </div>
      </div>
    </div>
  );
}
