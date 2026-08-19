const CareerReadinessCard = ({ readiness }) => {
  if (!readiness) return null;
  const score = readiness.score || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card">
      <p className="section-label mb-2">Trajectory</p>
      <h3 className="font-serif text-2xl mb-8">Career readiness</h3>
      <div className="flex items-center gap-10">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <svg className="transform -rotate-90" width="120" height="120">
            <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="6" fill="none" className="text-line" />
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
              className="text-gold"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-serif text-3xl text-gold tabular">{score.toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <p className="section-label mb-1">Completed skills</p>
          <p className="font-serif text-3xl">
            {readiness.completed_skills}/{readiness.total_skills}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerReadinessCard;
