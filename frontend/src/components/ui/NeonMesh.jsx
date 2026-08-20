import { useReducedMotion } from 'framer-motion';

export default function NeonMesh({ variant = 'page' }) {
  const reduce = useReducedMotion();
  const meshClass = variant === 'hero' ? 'mesh-hero' : 'mesh-page';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${meshClass}`} aria-hidden>
      <div className="bg-grid absolute inset-0" />
      <div
        className="mesh-blob bg-accent"
        style={{
          width: variant === 'hero' ? 480 : 300,
          height: variant === 'hero' ? 480 : 300,
          top: '-10%',
          left: '5%',
          animationDuration: reduce ? '0s' : '16s',
        }}
      />
      <div
        className="mesh-blob bg-violet"
        style={{
          width: variant === 'hero' ? 420 : 260,
          height: variant === 'hero' ? 420 : 260,
          top: '15%',
          right: '2%',
          animationDuration: reduce ? '0s' : '20s',
          animationDelay: '-4s',
        }}
      />
      <div
        className="mesh-blob bg-rose"
        style={{
          width: 280,
          height: 280,
          bottom: '-8%',
          left: '30%',
          animationDuration: reduce ? '0s' : '24s',
          animationDelay: '-8s',
        }}
      />
    </div>
  );
}
