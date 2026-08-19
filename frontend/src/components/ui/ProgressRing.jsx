export default function ProgressRing({ value = 0, size = 88, stroke = 8, tone = 'gold' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const colors = {
    gold: 'rgb(var(--gold))',
    violet: 'rgb(var(--violet))',
    teal: 'rgb(var(--teal))',
    rose: 'rgb(var(--rose))',
  };
  return (
    <svg width={size} height={size} className="tabular -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colors[tone] || colors.gold}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round"
      />
    </svg>
  );
}
