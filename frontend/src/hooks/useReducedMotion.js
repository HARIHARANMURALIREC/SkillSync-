import { useReducedMotion } from 'framer-motion';

export default function usePrefersReducedMotion() {
  return useReducedMotion();
}

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = (reduce) =>
  reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };

export const stagger = (reduce) =>
  reduce ? { hidden: {}, show: {} } : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
