import useCountUp from '../../hooks/useCountUp';
import Sparkline from './Sparkline';

const TONE_CLASS = {
  gold: 'text-accent',
  accent: 'text-accent',
  violet: 'text-violet',
  teal: 'text-teal',
  rose: 'text-rose',
};

export default function StatCard({ label, value, suffix = '', tone = 'accent', spark = [] }) {
  const n = useCountUp(Number(value) || 0);
  const display = Number.isInteger(Number(value)) ? Math.round(n) : n.toFixed(1);
  const toneClass = TONE_CLASS[tone] || TONE_CLASS.accent;

  return (
    <div className="card card-hover overflow-hidden panel-glow">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <p className="section-label">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={`stat-value text-4xl ${toneClass}`}>
          {display}
          {suffix && <span className="text-lg text-muted">{suffix}</span>}
        </p>
        <Sparkline values={spark} tone={tone} />
      </div>
    </div>
  );
}
