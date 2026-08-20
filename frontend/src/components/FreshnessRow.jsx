const STATUS_STYLE = {
  fresh: 'border-accent/40 bg-accent/10 text-accent shadow-neon-sm',
  aging: 'border-amber/40 bg-amber/10 text-amber',
  stale: 'border-rose/40 bg-rose/10 text-rose shadow-[0_0_8px_rgb(var(--rose)/0.3)]',
};

export default function FreshnessRow({ items = [], onRecert }) {
  if (!items.length) return null;
  return (
    <div className="card panel-glow">
      <p className="section-label mb-4">Skill freshness</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.skill_name}
            type="button"
            className={`chip transition-all hover:scale-[1.02] ${STATUS_STYLE[item.status] || 'chip-muted'}`}
            onClick={() => onRecert?.(item.skill_name)}
          >
            {item.skill_name}
            <span className="ml-2 opacity-70 capitalize">{item.status}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Aging after 7 days. Stale after 14. Tap a chip for a 3-question recert.</p>
    </div>
  );
}
