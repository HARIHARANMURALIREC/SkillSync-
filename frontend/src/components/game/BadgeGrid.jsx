export default function BadgeGrid({ badges = [] }) {
  return (
    <div className="card">
      <p className="section-label mb-4">Badges</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-2xl border p-3 ${
              badge.unlocked ? 'border-gold/40 bg-gold/10' : 'border-line opacity-50'
            }`}
          >
            <p className="font-serif text-sm">{badge.name}</p>
            <p className="text-xs text-muted mt-1">{badge.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
