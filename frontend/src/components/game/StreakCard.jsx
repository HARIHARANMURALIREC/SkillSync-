import { Flame } from 'lucide-react';

export default function StreakCard({ days = 0, heat = [] }) {
  return (
    <div className="card panel-glow">
      <div className="flex items-center justify-between">
        <p className="section-label">Streak</p>
        <span className="chip border-rose/40 bg-rose/10 text-rose shadow-[0_0_10px_rgb(var(--rose)/0.25)]">
          <Flame size={12} className="mr-1" /> {days} day{days === 1 ? '' : 's'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 w-max">
        {heat.map((d) => (
          <span key={d.key} className={d.on ? 'heat-cell-on' : 'heat-cell'} title={d.key} />
        ))}
      </div>
    </div>
  );
}
