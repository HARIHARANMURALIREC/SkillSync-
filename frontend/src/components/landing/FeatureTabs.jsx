import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ChartNoAxesCombined, Map, MessageCircle } from 'lucide-react';
import { fadeUp, stagger } from '../../hooks/useReducedMotion';
import { useReducedMotion } from 'framer-motion';

const tabs = [
  { id: 'assess', icon: ClipboardList, title: 'Assess', body: 'Weighted MCQs place you on a 0–10 scale. Scoring is math, not a model guess.' },
  { id: 'gap', icon: ChartNoAxesCombined, title: 'See the gap', body: 'Targets come from your career goal. High-priority skills surface first.' },
  { id: 'path', icon: Map, title: 'Weekly path', body: 'Four weeks, ordered by prerequisites, sized to the hours you actually have.' },
  { id: 'coach', icon: MessageCircle, title: 'Coach locally', body: 'Mistral runs through Ollama on your machine. Plans stay private.' },
];

export default function FeatureTabs() {
  const [active, setActive] = useState('assess');
  const reduce = useReducedMotion();
  const current = tabs.find((t) => t.id === active);
  const Icon = current.icon;
  return (
    <motion.div className="grid gap-6 lg:grid-cols-2" variants={stagger(reduce)} initial="hidden" whileInView="show" viewport={{ once: true }}>
      <div className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`relative w-full rounded-lg border px-4 py-3 text-left transition-all ${
              active === tab.id
                ? 'border-accent/50 bg-accent/10 shadow-neon-sm'
                : 'border-line bg-surface hover:border-accent/30'
            }`}
          >
            {active === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent to-violet" />
            )}
            <span className="text-lg font-semibold">{tab.title}</span>
          </button>
        ))}
      </div>
      <motion.div key={active} variants={fadeUp(reduce)} className="card panel-glow">
        <Icon className="mb-4 text-accent" />
        <h3 className="text-2xl font-bold mb-3">{current.title}</h3>
        <p className="text-muted leading-relaxed">{current.body}</p>
      </motion.div>
    </motion.div>
  );
}
