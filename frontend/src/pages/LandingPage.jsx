import { Link, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Gauge, RefreshCw, GitBranch, Cpu, Eye, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Aurora from '../components/ui/Aurora';
import ThemeToggle from '../components/ui/ThemeToggle';
import FeatureTabs from '../components/landing/FeatureTabs';
import AppPreview from '../components/landing/AppPreview';
import LevelMock from '../components/landing/LevelMock';
import useCountUp from '../hooks/useCountUp';
import { fadeUp, stagger } from '../hooks/useReducedMotion';

const gains = [
  { icon: Gauge, title: 'Career readiness', body: 'One score for how close you are to the role.' },
  { icon: RefreshCw, title: 'Adaptive pacing', body: 'Revision weeks when progress stalls.' },
  { icon: GitBranch, title: 'Prerequisite-aware weeks', body: 'Skills ordered so foundations come first.' },
  { icon: Cpu, title: 'Runs on your machine', body: 'Mistral via Ollama. Coaching stays on-device.' },
  { icon: Eye, title: 'Explainable', body: 'Scores are weighted math. Gaps show their work.' },
  { icon: Clock, title: 'Hours-aware', body: 'Plans sized to the hours you can actually spare.' },
];

const steps = [
  { n: '01', t: 'Set a goal' },
  { n: '02', t: 'Assess skills' },
  { n: '03', t: 'Get a path' },
  { n: '04', t: 'Learn & adapt' },
];

const LandingPage = () => {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const badges = Math.round(useCountUp(12));
  const levels = Math.round(useCountUp(8));
  const local = Math.round(useCountUp(100));
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <Aurora variant="hero" />
      <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-serif text-xl">SkillSync</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-16">
        <motion.section className="grid items-center gap-12 lg:grid-cols-2" variants={stagger(reduce)} initial="hidden" animate="show">
          <motion.div variants={fadeUp(reduce)}>
            <p className="chip-gold mb-6">Personalized learning, computed locally</p>
            <h1 className="font-serif text-5xl leading-tight md:text-6xl">
              Close the gap to your <span className="italic text-gradient">next role.</span>
            </h1>
            <p className="mt-6 max-w-md text-muted leading-relaxed">
              Assess a skill. See the gap. Follow a weekly plan. Earn XP and keep a streak. Coaching runs on-device through Ollama.
            </p>
            <div className="mt-8 flex flex-wrap gap-8 font-serif text-3xl tabular">
              <div><span>{badges}</span><p className="text-xs uppercase tracking-[0.16em] text-muted mt-1">badges</p></div>
              <div><span>{levels}</span><p className="text-xs uppercase tracking-[0.16em] text-muted mt-1">levels</p></div>
              <div><span>{local}%</span><p className="text-xs uppercase tracking-[0.16em] text-muted mt-1">on-device AI</p></div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp(reduce)}><AppPreview /></motion.div>
        </motion.section>

        <section className="mt-28">
          <p className="page-kicker">The loop</p>
          <h2 className="page-title mb-8">Four product parts</h2>
          <FeatureTabs />
        </section>

        <section className="mt-28 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="page-kicker">Momentum</p>
            <h2 className="page-title">Progress you can feel</h2>
            <p className="mt-4 text-muted">XP, eight levels from Novice to Luminary, streaks, and twelve badges.</p>
          </div>
          <LevelMock />
        </section>

        <section className="mt-28">
          <p className="page-kicker">What you get</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gains.map((g) => (
              <div key={g.title} className="card card-hover">
                <g.icon className="mb-4 text-gold" size={20} />
                <h3 className="font-serif text-xl mb-2">{g.title}</h3>
                <p className="text-sm text-muted">{g.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <p className="page-kicker">How it works</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4 relative">
            <div className="absolute left-8 right-8 top-6 hidden h-px bg-gold/40 md:block" />
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-mono text-gold">{s.n}</span>
                <p className="mt-3 font-serif text-xl">{s.t}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28 card text-center py-16">
          <h2 className="font-serif text-4xl">No cloud model in the loop.</h2>
          <p className="mt-4 text-muted">Private by default. Create an account and keep the work on your machine.</p>
          <Link to="/signup" className="btn-primary mt-8">Create account</Link>
        </section>
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        SkillSync · Built with FastAPI, React and Ollama
      </footer>
    </div>
  );
};

export default LandingPage;
