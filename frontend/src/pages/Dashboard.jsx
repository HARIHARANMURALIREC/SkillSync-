import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const { level, heat, badges, streakDays } = useProgress();
  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">{greeting()}</p>
          <h1 className="page-title">{first}</h1>
        </div>
        <button className="btn-primary" onClick={() => navigate(next.to)}>{next.label}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value={summary.total_assessments || 0} tone="gold" spark={scores} />
        <StatCard label="Average score" value={avgScore} suffix=" /10" tone="violet" spark={scores} />
        <StatCard label="Path completion" value={summary.path_completion_pct || 0} suffix="%" tone="teal" />
        <StatCard label="High-priority gaps" value={highGaps} tone="rose" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LevelCard level={level} />
        <StreakCard days={streakDays} heat={heat} />
      </div>

      {dashboardData?.career_readiness && <CareerReadinessCard readiness={dashboardData.career_readiness} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <SkillRadarChart data={dashboardData?.skill_radar} />
        <div className="card">
          <p className="section-label mb-4">Score trend</p>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <XAxis dataKey="i" stroke="rgb(var(--muted))" />
                <YAxis domain={[0, 10]} stroke="rgb(var(--muted))" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="rgb(var(--gold))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">No history yet.</p>
          )}
        </div>
      </div>

      <SkillGapTable gaps={dashboardData?.skill_gaps} />
      <ExplainabilityPanel
        explanations={
          highGaps
            ? [`${highGaps} high priority skills identified`, 'Skills are prioritized by gap size and career requirements']
            : []
        }
      />
      <BadgeGrid badges={badges} />
    </div>
  );
};

export default Dashboard;
