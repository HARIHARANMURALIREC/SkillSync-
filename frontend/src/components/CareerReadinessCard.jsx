const CareerReadinessCard = ({ readiness }) => {
  if (!readiness) return null;
  const score = readiness.score || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card panel-glow">
      <p className="section-label mb-2">Trajectory</p>
      <h3 className="text-2xl font-bold mb-8">Career readiness</h3>
      <div className="flex items-center gap-10">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <svg className="transform -rotate-90 drop-shadow-[0_0_8px_rgb(var(--accent)/0.35)]" width="120" height="120">
            <circle cx="60" cy="60" r={radius} stroke="rgb(var(--line))" strokeWidth="6" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgb(var(--accent))"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-3xl font-bold text-accent tabular">{score.toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <p className="section-label mb-1">Completed skills</p>
          <p className="font-mono text-3xl font-bold tabular">
            {readiness.completed_skills}/{readiness.total_skills}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerReadinessCard;
