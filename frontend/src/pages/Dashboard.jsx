import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import SkillRadarChart from '../components/RadarChart';
import SkillGapTable from '../components/SkillGapTable';
import ProgressCards from '../components/ProgressCards';
import CareerReadinessCard from '../components/CareerReadinessCard';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, historyRes] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/assessment/history').catch(() => ({ data: [] })),
      ]);
      setDashboardData(dashboardRes.data);
      setHistory(historyRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(getApiErrorMessage(err, 'Failed to load dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-16">
        <p className="text-red-300 mb-6">{error}</p>
        <button onClick={() => { setLoading(true); fetchDashboard(); }} className="btn-primary">
          Try again
        </button>
      </div>
    );
  }

  const hasCareerGoal = dashboardData?.user?.career_goal;
  const hasAssessments = dashboardData?.progress_summary?.total_assessments > 0;
  const name = dashboardData?.user?.full_name || dashboardData?.user?.email;

  const chartData = history.map((entry, idx) => ({
    index: idx + 1,
    label: entry.skill_name,
    score: entry.score,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="page-kicker">Overview</p>
        <h1 className="page-title">
          {name}
        </h1>
        <p className="mt-3 text-muted">
          {hasCareerGoal
            ? `Working toward ${dashboardData.user.career_goal}`
            : 'Set a career goal to personalize recommendations'}
        </p>
      </div>

      <ProgressCards summary={dashboardData?.progress_summary} />

      {dashboardData?.career_readiness && (
        <CareerReadinessCard readiness={dashboardData.career_readiness} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadarChart data={dashboardData?.skill_radar} />

        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Next step</p>
            <h3 className="font-serif text-2xl mb-3">Quick actions</h3>
            <p className="text-sm text-muted mb-8">
              Keep the loop moving: goal, assessment, then a generated path.
            </p>
          </div>
          <div className="space-y-3">
            {!hasCareerGoal && (
              <button onClick={() => navigate('/profile')} className="btn-primary w-full">
                Set career goal
              </button>
            )}
            {!hasAssessments && (
              <button onClick={() => navigate('/assessment')} className="btn-primary w-full">
                Take an assessment
              </button>
            )}
            {hasCareerGoal && hasAssessments && (
              <button onClick={() => navigate('/learning-path')} className="btn-primary w-full">
                View learning path
              </button>
            )}
            <button onClick={() => navigate('/coach')} className="btn-secondary w-full">
              Ask your coach
            </button>
          </div>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="card">
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Trend</p>
          <h3 className="font-serif text-2xl mb-6">Assessment history</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="index"
                  tick={{ fill: '#a8a29e', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: '#a8a29e', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1814',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ? `${payload[0].payload.label}` : ''
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#c9a227"
                  strokeWidth={2}
                  dot={{ fill: '#c9a227', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <SkillGapTable gaps={dashboardData?.skill_gaps} />

      {dashboardData?.skill_gaps && dashboardData.skill_gaps.length > 0 && (
        <ExplainabilityPanel
          explanations={[
            `Based on your career goal: ${dashboardData.user.career_goal}`,
            `${dashboardData.skill_gaps.filter((g) => g.priority === 'High').length} high priority skills identified`,
            'Skills are prioritized by gap size and career requirements',
          ]}
          title="How these recommendations are made"
        />
      )}
    </div>
  );
};

export default Dashboard;
