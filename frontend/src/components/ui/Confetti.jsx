import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function Confetti({ fire }) {
  const reduce = useReducedMotion();
  const [bits, setBits] = useState([]);

  useEffect(() => {
    if (!fire || reduce) return undefined;
    const colors = ['rgb(var(--gold))', 'rgb(var(--violet))', 'rgb(var(--teal))', 'rgb(var(--rose))'];
    setBits(
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        color: colors[i % colors.length],
      }))
    );
    const t = setTimeout(() => setBits([]), 1600);
    return () => clearTimeout(t);
  }, [fire, reduce]);

  if (!bits.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${b.left}%`,
            background: b.color,
            animation: `aurora-drift 1.2s ${b.delay}s ease-out both`,
          }}
        />
      ))}
    </div>
  );
}
