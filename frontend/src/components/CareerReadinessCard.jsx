const CareerReadinessCard = ({ readiness }) => {
  if (!readiness) {
    return null;
  }

  const score = readiness.score || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Trajectory</p>
      <h3 className="font-serif text-2xl mb-8">Career readiness</h3>

      <div className="flex items-center gap-10">
        <div className="relative" style={{ width: '120px', height: '120px' }}>
          <svg className="transform -rotate-90" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-gold transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-3xl text-gold">{score.toFixed(0)}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-1">Completed skills</p>
          <p className="font-serif text-3xl">
            {readiness.completed_skills}/{readiness.total_skills}
          </p>
          <p className="text-sm text-muted mt-3">
            Based on required skills for your chosen career
          </p>
        </div>
      </div>

      {readiness.missing_skills && readiness.missing_skills.length > 0 && (
        <p className="mt-6 pt-5 border-t border-white/10 text-sm text-muted">
          {readiness.missing_skills.length} skill{readiness.missing_skills.length !== 1 ? 's' : ''} still need work
        </p>
      )}
    </div>
  );
};

export default CareerReadinessCard;
