import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, ChartNoAxesCombined, Map, RefreshCw, Sparkles, Gauge } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const features = [
  {
    icon: Target,
    title: 'Skill assessment',
    body: 'Weighted MCQs that place you on a 0–10 scale with a clear beginner, intermediate, or advanced level.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Gap analysis',
    body: 'See how your skills compare to a career target, ranked by what will move the needle first.',
  },
  {
    icon: Map,
    title: 'Weekly paths',
    body: 'A four-week plan with real resources, ordered by prerequisites and the hours you actually have.',
  },
  {
    icon: RefreshCw,
    title: 'Adaptive pacing',
    body: 'Revision weeks when progress stalls. Faster schedules when you are already ahead.',
  },
  {
    icon: Sparkles,
    title: 'Local AI',
    body: 'Groq is primary. If it is down, coaching falls back to Mistral on your machine via Ollama.',
  },
  {
    icon: Gauge,
    title: 'Career readiness',
    body: 'A single score that shows how close you are to the role you are aiming for.',
  },
];

const steps = [
  { n: '01', title: 'Set a goal', body: 'Choose the role you are working toward.' },
  { n: '02', title: 'Assess skills', body: 'Sit a short MCQ for each relevant skill.' },
  { n: '03', title: 'Get a path', body: 'Generate a weekly plan from your gaps.' },
  { n: '04', title: 'Learn & adapt', body: 'Follow it. The schedule adjusts as you go.' },
];

const ease = [0.22, 1, 0.36, 1];
const view = { once: true, margin: '-80px' };
const MotionLink = motion.create(Link);

const LandingPage = () => {
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const fadeUp = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      };

  const stagger = reduce
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  const hoverLift = reduce ? undefined : { y: -2 };
  const hoverCta = reduce ? undefined : { scale: 1.02 };
  const tapCta = reduce ? undefined : { scale: 0.99 };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <motion.header
        className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl tracking-tight">
            SkillSync
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-muted hover:text-cream transition-colors">
              Sign in
            </Link>
            <MotionLink
              to="/signup"
              className="btn-primary text-sm inline-block"
              whileHover={hoverCta}
              whileTap={tapCta}
            >
              Get started
            </MotionLink>
          </div>
        </div>
      </motion.header>

      <motion.section
        className="max-w-6xl mx-auto px-6 pt-24 pb-28"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <motion.p className="page-kicker" variants={fadeUp}>
          Personalized learning
        </motion.p>
        <motion.h1
          className="font-serif text-5xl md:text-7xl leading-[1.05] max-w-4xl"
          variants={stagger}
        >
          <motion.span className="block" variants={fadeUp}>
            A quieter way to close the gap to your
          </motion.span>
          <motion.span className="italic text-gold" variants={fadeUp}>
            {' '}next role.
          </motion.span>
        </motion.h1>
        <motion.p className="mt-8 text-lg text-muted max-w-xl leading-relaxed" variants={fadeUp}>
          Assess what you know, see what a career actually requires, and follow a weekly path generated on your machine.
        </motion.p>
        <motion.div className="mt-10 flex flex-wrap gap-4" variants={fadeUp}>
          <MotionLink
            to="/signup"
            className="btn-primary px-7 py-3 inline-block"
            whileHover={hoverCta}
            whileTap={tapCta}
          >
            Begin free
          </MotionLink>
          <Link to="/login" className="btn-secondary px-7 py-3">
            Sign in
          </Link>
        </motion.div>
      </motion.section>

      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={view}
            variants={stagger}
          >
            <motion.p className="page-kicker" variants={fadeUp}>Capabilities</motion.p>
            <motion.h2 className="font-serif text-4xl mb-14" variants={fadeUp}>
              What SkillSync does
            </motion.h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden"
            initial="hidden"
            whileInView="show"
            viewport={view}
            variants={stagger}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="bg-ink p-8"
                  variants={fadeUp}
                  whileHover={hoverLift}
                >
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={view}
                    transition={{ duration: 0.5, delay: 0.12, ease }}
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-gold mb-5" />
                  </motion.div>
                  <h3 className="font-serif text-xl mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={view}
            variants={stagger}
          >
            <motion.p className="page-kicker" variants={fadeUp}>Method</motion.p>
            <motion.h2 className="font-serif text-4xl mb-16" variants={fadeUp}>
              Four steps
            </motion.h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-4 gap-10"
            initial="hidden"
            whileInView="show"
            viewport={view}
            variants={stagger}
          >
            {steps.map((step) => (
              <motion.div key={step.n} variants={stagger}>
                <motion.p className="font-serif text-gold text-2xl mb-4" variants={fadeUp}>
                  {step.n}
                </motion.p>
                <motion.h3 className="font-serif text-xl mb-2" variants={fadeUp}>
                  {step.title}
                </motion.h3>
                <motion.p className="text-sm text-muted leading-relaxed" variants={fadeUp}>
                  {step.body}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <motion.div
          className="max-w-6xl mx-auto px-6 py-24 md:flex md:items-end md:justify-between gap-10"
          initial="hidden"
          whileInView="show"
          viewport={view}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <p className="page-kicker">Fast by default</p>
            <h2 className="font-serif text-4xl md:text-5xl max-w-lg leading-tight">
              Groq primary. Ollama fallback.
            </h2>
            <p className="mt-6 text-muted max-w-md leading-relaxed">
              Coaching, gaps, and weekly plans use Groq first. If Groq is unavailable, SkillSync falls back to local Ollama. Scoring stays deterministic math.
            </p>
          </motion.div>
          <MotionLink
            to="/signup"
            className="btn-primary mt-8 md:mt-0 px-8 py-3 shrink-0 inline-block"
            variants={fadeUp}
            whileHover={hoverCta}
            whileTap={tapCta}
          >
            Start learning
          </MotionLink>
        </motion.div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div>
            <span className="font-serif text-cream">SkillSync</span>
          </div>
          <p>© {new Date().getFullYear()} SkillSync</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
