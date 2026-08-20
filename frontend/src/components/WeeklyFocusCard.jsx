import { Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WeeklyFocusCard({ plan }) {
  const navigate = useNavigate();
  if (!plan?.focus) return null;

  const items = (plan.plan || []).slice(0, 3);
  const starter = `Help me with this week's focus: ${plan.focus}`;

  return (
    <div className="card panel-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Weekly focus</p>
          <h3 className="mt-2 text-xl font-bold">{plan.focus}</h3>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-violet/35 bg-violet/10">
          <Calendar className="text-violet" size={18} />
        </div>
      </div>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.skill} className="flex gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                <span className="font-medium text-fg">{item.skill}</span>
                {' · '}
                {item.hours}h — {item.action}
              </span>
            </li>
          ))}
        </ul>
      )}
      {plan.check_in && (
        <p className="mt-4 text-xs text-muted">
          Check-in target: <span className="text-fg">{plan.check_in}</span>
        </p>
      )}
      <button
        type="button"
        className="btn-secondary mt-5 inline-flex items-center gap-2"
        onClick={() => navigate('/coach', { state: { starter } })}
      >
        <MessageCircle size={16} />
        Ask coach about this plan
      </button>
    </div>
  );
}
