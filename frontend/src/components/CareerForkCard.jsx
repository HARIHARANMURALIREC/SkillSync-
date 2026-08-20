export default function CareerForkCard({ fork, onSwitch, switching }) {
  if (!fork?.message) return null;
  const current = fork.current_score || 0;
  const adjacent = fork.best_score || 0;
  const showSwitch = Boolean(fork.best_adjacent && fork.best_adjacent !== fork.current_role);

  return (
    <div className="card panel-glow">
      <p className="section-label">Career fork</p>
      <h3 className="mt-2 text-2xl font-bold">Cheapest pivot</h3>
      <p className="mt-2 text-sm text-muted">{fork.message}</p>
      <div className="mt-5 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{fork.current_role || 'Current role'}</span>
            <span className="tabular font-mono">{current.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full rounded-full bg-accent shadow-neon-sm" style={{ width: `${Math.min(100, current)}%` }} />
          </div>
        </div>
        {showSwitch && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>{fork.best_adjacent}</span>
              <span className="tabular font-mono text-teal">{adjacent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <div className="h-full rounded-full bg-teal shadow-[0_0_8px_rgb(var(--teal)/0.4)]" style={{ width: `${Math.min(100, adjacent)}%` }} />
            </div>
            {fork.weeks_saved > 0 && (
              <p className="mt-2 text-xs text-accent font-medium">
                ~{fork.weeks_saved} weeks saved vs current goal
              </p>
            )}
          </div>
        )}
      </div>
      {fork.blocking_skills?.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          Blocking {fork.current_role}: {fork.blocking_skills.join(', ')}
        </p>
      )}
      {showSwitch && (
        <button className="btn-secondary mt-5" disabled={switching} onClick={() => onSwitch(fork.best_adjacent)}>
          {switching ? 'Switching…' : `Switch goal to ${fork.best_adjacent}`}
        </button>
      )}
    </div>
  );
}
