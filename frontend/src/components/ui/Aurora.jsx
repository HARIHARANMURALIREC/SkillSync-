import { useReducedMotion } from 'framer-motion';

export default function Aurora({ variant = 'page' }) {
  const reduce = useReducedMotion();
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden aurora-${variant}`} aria-hidden>
      <div className="bg-grid absolute inset-0" />
      <div
        className="aurora-blob bg-violet"
        style={{
          width: variant === 'hero' ? 420 : 280,
          height: variant === 'hero' ? 420 : 280,
          top: '-8%',
          left: '8%',
          animationDuration: reduce ? '0s' : '18s',
        }}
      />
      <div
        className="aurora-blob bg-gold"
        style={{
          width: variant === 'hero' ? 380 : 240,
          height: variant === 'hero' ? 380 : 240,
          top: '20%',
          right: '4%',
          animationDuration: reduce ? '0s' : '22s',
        }}
      />
      <div
        className="aurora-blob bg-teal"
        style={{
          width: 240,
          height: 240,
          bottom: '-6%',
          left: '28%',
          animationDuration: reduce ? '0s' : '26s',
        }}
      />
    </div>
  );
}
