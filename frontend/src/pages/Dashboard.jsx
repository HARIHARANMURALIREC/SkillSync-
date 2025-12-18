import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SkillRadarChart from '../components/RadarChart';
import SkillGapTable from '../components/SkillGapTable';
import ProgressCards from '../components/ProgressCards';
import CareerReadinessCard from '../components/CareerReadinessCard';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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

  const hasCareerGoal = dashboardData?.user?.career_goal;
  const hasAssessments = dashboardData?.progress_summary?.total_assessments > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {dashboardData?.user?.full_name || dashboardData?.user?.email}!
        </h1>
        <p className="text-primary-100">
          {hasCareerGoal
            ? `Your career goal: ${dashboardData.user.career_goal}`
            : 'Set your career goal to get personalized learning recommendations'}
        </p>
      </div>

      {/* Progress Cards */}
      <ProgressCards summary={dashboardData?.progress_summary} />

      {/* Career Readiness */}
      {dashboardData?.career_readiness && (
        <CareerReadinessCard readiness={dashboardData.career_readiness} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <SkillRadarChart data={dashboardData?.skill_radar} />

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {!hasCareerGoal && (
              <button
                onClick={() => navigate('/profile')}
                className="btn-primary w-full"
              >
                Set Career Goal
              </button>
            )}
            {!hasAssessments && (
              <button
                onClick={() => navigate('/assessment')}
                className="btn-primary w-full"
              >
                Take Skill Assessment
              </button>
            )}
            {hasCareerGoal && hasAssessments && (
              <button
                onClick={() => navigate('/learning-path')}
                className="btn-primary w-full"
              >
                View Learning Path
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skill Gaps Table */}
      <SkillGapTable gaps={dashboardData?.skill_gaps} />

      {/* Explainability Panel for overall recommendations */}
      {dashboardData?.skill_gaps && dashboardData.skill_gaps.length > 0 && (
        <ExplainabilityPanel
          explanations={[
            `Based on your career goal: ${dashboardData.user.career_goal}`,
            `${dashboardData.skill_gaps.filter(g => g.priority === 'High').length} high priority skills identified`,
            `Skills are prioritized by gap size and career requirements`
          ]}
          title="How are these recommendations generated?"
        />
      )}
    </div>
  );
};

export default Dashboard;

