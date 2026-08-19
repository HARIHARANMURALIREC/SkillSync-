import Aurora from './ui/Aurora';

export default function AuthShell({ kicker, title, accent, children, highlights }) {
  return (
    <div className="relative min-h-screen grid lg:grid-cols-[44%_1fr] bg-bg text-fg">
      <div className="relative hidden overflow-hidden lg:block border-r border-line">
        <Aurora variant="hero" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <p className="font-serif text-2xl">SkillSync</p>
          <div>
            <p className="page-kicker">{kicker}</p>
            <h1 className="font-serif text-5xl leading-tight">
              {title} <span className="italic text-gradient">{accent}</span>
            </h1>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              {(highlights || ['Scoring stays math.', 'Plans sized to your hours.', 'Mistral runs locally.']).map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-faint">Private by default. No cloud model in the loop.</p>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-6 py-16">{children}</div>
    </div>
  );
}
