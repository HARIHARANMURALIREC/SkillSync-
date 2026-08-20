import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import SkillRadarChart from '../components/RadarChart';
import SkillGapTable from '../components/SkillGapTable';
import CareerReadinessCard from '../components/CareerReadinessCard';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import LevelCard from '../components/game/LevelCard';
import StreakCard from '../components/game/StreakCard';
import BadgeGrid from '../components/game/BadgeGrid';
import CareerForkCard from '../components/CareerForkCard';
import FreshnessRow from '../components/FreshnessRow';
import WeeklyFocusCard from '../components/WeeklyFocusCard';
import { fadeUp, stagger } from '../hooks/useReducedMotion';
import { useReducedMotion } from 'framer-motion';
import { Share2 } from 'lucide-react';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const { level, heat, badges, streakDays, refreshProgress } = useProgress();
  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, hist] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/assessment/history').catch(() => ({ data: [] })),
        ]);
        setDashboardData(dash.data);
        setHistory(hist.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return <EmptyState title="Could not load dashboard" body={error} action={<button className="btn-primary" onClick={() => window.location.reload()}>Try again</button>} />;
  }

  const first = (user?.full_name || user?.email || 'there').split(' ')[0];
  const summary = dashboardData?.progress_summary || {};
  const highGaps = (dashboardData?.skill_gaps || []).filter((g) => g.priority === 'High').length;
  const scores = history.map((h) => h.score);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const chartData = history.map((entry, idx) => ({ i: idx + 1, score: entry.score, label: entry.skill_name }));
  const hasGoal = Boolean(dashboardData?.user?.career_goal);
  const hasAssess = (summary.total_assessments || 0) > 0;

  const next = !hasGoal
    ? { label: 'Set a career goal', to: '/profile' }
    : !hasAssess
      ? { label: 'Take a first assessment', to: '/assessment' }
      : { label: 'Open your path', to: '/learning-path' };

  return (
    <motion.div className="space-y-8" variants={stagger(reduce)} initial="hidden" animate="show">
      <motion.div variants={fadeUp(reduce)} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">{greeting()}</p>
          <h1 className="page-title">{first}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary inline-flex items-center gap-2" onClick={() => navigate('/report')}>
            <Share2 size={16} />
            Share readiness report
          </button>
          <button className="btn-primary" onClick={() => navigate(next.to)}>{next.label}</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp(reduce)} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value={summary.total_assessments || 0} tone="accent" spark={scores} />
        <StatCard label="Average score" value={avgScore} suffix=" /10" tone="violet" spark={scores} />
        <StatCard label="Path completion" value={summary.path_completion_pct || 0} suffix="%" tone="teal" />
        <StatCard label="High-priority gaps" value={highGaps} tone="rose" />
      </motion.div>

      <motion.div variants={fadeUp(reduce)} className="grid gap-4 lg:grid-cols-2">
        <LevelCard level={level} />
        <StreakCard days={streakDays} heat={heat} />
      </motion.div>

      <motion.div variants={fadeUp(reduce)} className="grid gap-4 lg:grid-cols-2">
        {dashboardData?.weekly_plan && <WeeklyFocusCard plan={dashboardData.weekly_plan} />}
        {dashboardData?.career_fork && (
          <CareerForkCard
            fork={dashboardData.career_fork}
            switching={switching}
            onSwitch={async (goal) => {
              setSwitching(true);
              try {
                const res = await api.put('/api/profile', { career_goal: goal });
                setUser(res.data);
                const dash = await api.get('/api/dashboard');
                setDashboardData(dash.data);
                await refreshProgress?.();
              } finally {
                setSwitching(false);
              }
            }}
          />
        )}
        {dashboardData?.career_readiness && <CareerReadinessCard readiness={dashboardData.career_readiness} />}
      </motion.div>

      <motion.div variants={fadeUp(reduce)}>
        <FreshnessRow
          items={dashboardData?.freshness || []}
          onRecert={(skill) => navigate(`/assessment/${encodeURIComponent(skill)}?recert=1`)}
        />
      </motion.div>

      <motion.div variants={fadeUp(reduce)} className="grid gap-4 lg:grid-cols-2">
        <SkillRadarChart data={dashboardData?.skill_radar} />
        <div className="card panel-glow">
          <p className="section-label mb-4">Score trend</p>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <XAxis dataKey="i" stroke="rgb(var(--muted))" tick={{ fill: 'rgb(var(--muted))', fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="rgb(var(--muted))" tick={{ fill: 'rgb(var(--muted))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--surface))',
                    border: '1px solid rgb(var(--line))',
                    borderRadius: '8px',
                    color: 'rgb(var(--fg))',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="rgb(var(--accent))" strokeWidth={2} dot={{ fill: 'rgb(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">No history yet.</p>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp(reduce)}>
        <SkillGapTable gaps={dashboardData?.skill_gaps} />
      </motion.div>
      <motion.div variants={fadeUp(reduce)}>
        <ExplainabilityPanel
          explanations={
            highGaps
              ? [`${highGaps} high priority skills identified`, 'Skills are prioritized by gap size and career requirements']
              : []
          }
        />
      </motion.div>
      <motion.div variants={fadeUp(reduce)}>
        <BadgeGrid badges={badges} />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
