import useCountUp from '../../hooks/useCountUp';
import Sparkline from './Sparkline';

export default function StatCard({ label, value, suffix = '', tone = 'gold', spark = [] }) {
  const n = useCountUp(Number(value) || 0);
  const display = Number.isInteger(Number(value)) ? Math.round(n) : n.toFixed(1);
  return (
    <div className={`card card-hover overflow-hidden`}>
      <p className="section-label">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={`font-serif text-4xl tabular text-${tone}`}>
          {display}
          {suffix && <span className="text-lg text-muted">{suffix}</span>}
        </p>
        <Sparkline values={spark} tone={tone} />
      </div>
    </div>
  );
}
