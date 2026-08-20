export default function Sparkline({ values = [], tone = 'accent' }) {
  if (!values.length) return <div className="h-8" />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 80;
      const y = 22 - ((v - min) / (max - min || 1)) * 18;
      return `${x},${y}`;
    })
    .join(' ');
  const stroke = {
    gold: 'rgb(var(--accent))',
    accent: 'rgb(var(--accent))',
    violet: 'rgb(var(--violet))',
    teal: 'rgb(var(--teal))',
    rose: 'rgb(var(--rose))',
  }[tone] || 'rgb(var(--accent))';

  return (
    <svg viewBox="0 0 80 24" className="h-8 w-20">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={pts} />
    </svg>
  );
}
