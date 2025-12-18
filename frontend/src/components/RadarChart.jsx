import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkillRadarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-gray-500 py-12">
        <p>No skill data available. Complete an assessment to see your skills.</p>
      </div>
    );
  }

  // Format data for radar chart
  const chartData = data.map((skill) => ({
    skill: skill.skill_name,
    level: skill.level,
    fullMark: 10,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Skill Radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
          <Radar
            name="Skill Level"
            dataKey="level"
            stroke="#6a1b9a"
            fill="#6a1b9a"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;

