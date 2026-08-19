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
            className={`w-full rounded-2xl border px-4 py-3 text-left ${
              active === tab.id ? 'border-gold/40 bg-gold/10' : 'border-line bg-surface'
            }`}
          >
            <span className="font-serif text-lg">{tab.title}</span>
          </button>
        ))}
      </div>
      <motion.div key={active} variants={fadeUp(reduce)} className="card">
        <Icon className="mb-4 text-gold" />
        <h3 className="font-serif text-2xl mb-3">{current.title}</h3>
        <p className="text-muted leading-relaxed">{current.body}</p>
      </motion.div>
    </motion.div>
  );
}
