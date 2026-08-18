import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkillRadarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-muted">Complete an assessment to see your skill radar.</p>
      </div>
    );
  }

  const chartData = data.map((skill) => ({
    skill: skill.skill_name,
    level: skill.level,
    fullMark: 10,
  }));

  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Profile</p>
      <h3 className="font-serif text-2xl mb-6">Skill radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#9A9588' }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: '#6E6A62' }} />
          <Radar
            name="Skill Level"
            dataKey="level"
            stroke="#C8A96A"
            fill="#C8A96A"
            fillOpacity={0.28}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
