export default function ProgressRing({ value = 0, size = 88, stroke = 8, tone = 'accent' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const colors = {
    gold: 'rgb(var(--accent))',
    accent: 'rgb(var(--accent))',
    violet: 'rgb(var(--violet))',
    teal: 'rgb(var(--teal))',
    rose: 'rgb(var(--rose))',
  };

  return (
    <svg width={size} height={size} className="tabular -rotate-90 drop-shadow-[0_0_8px_rgb(var(--accent)/0.4)]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colors[tone] || colors.accent}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round"
      />
    </svg>
  );
}
