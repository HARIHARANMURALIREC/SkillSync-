export default function BadgeGrid({ badges = [] }) {
  return (
    <div className="card panel-glow">
      <p className="section-label mb-4">Badges</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-lg border p-3 transition-all ${
              badge.unlocked
                ? 'border-accent/40 bg-accent/10 shadow-neon-sm hover:scale-[1.02]'
                : 'border-line opacity-40'
            }`}
          >
            <p className="text-sm font-semibold">{badge.name}</p>
            <p className="text-xs text-muted mt-1">{badge.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
