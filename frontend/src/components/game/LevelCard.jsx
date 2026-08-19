import ProgressRing from '../ui/ProgressRing';

export default function LevelCard({ level }) {
  return (
    <div className="card">
      <p className="section-label">Level</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative">
          <ProgressRing value={level.progress} tone="violet" />
          <span className="absolute inset-0 grid place-items-center font-mono text-sm tabular">
            {level.level}
          </span>
        </div>
        <div>
          <h3 className="font-serif text-2xl">{level.title}</h3>
          <p className="text-sm text-muted tabular">{Math.round(level.xp)} XP</p>
          {level.next && (
            <p className="text-xs text-faint mt-1">Next: {level.next.title} at {level.next.xp} XP</p>
          )}
        </div>
      </div>
    </div>
  );
}
