const CareerReadinessCard = ({ readiness }) => {
  if (!readiness) {
    return null;
  }

  const score = readiness.score || 0;
  
  // Determine color based on score
  const getColor = () => {
    if (score < 40) return 'text-red-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBgColor = () => {
    if (score < 40) return 'bg-red-100';
    if (score < 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getBorderColor = () => {
    if (score < 40) return 'border-red-300';
    if (score < 70) return 'border-yellow-300';
    return 'border-green-300';
  };

  // Calculate circle stroke for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`card ${getBgColor()} border-2 ${getBorderColor()}`}>
      <h3 className="text-lg font-semibold mb-4">Career Readiness</h3>
      
      <div className="flex items-center justify-center space-x-8">
        {/* Circular Progress */}
        <div className="relative" style={{ width: '120px', height: '120px' }}>
          <svg className="transform -rotate-90" width="120" height="120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${getColor()} transition-all duration-500`}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getColor()}`}>
                {score.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Completed Skills</p>
              <p className="text-2xl font-bold text-gray-900">
                {readiness.completed_skills}/{readiness.total_skills}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Based on required skills for your chosen career</p>
            </div>
          </div>
        </div>
      </div>

      {/* Missing skills hint */}
      {readiness.missing_skills && readiness.missing_skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {readiness.missing_skills.length} skill{readiness.missing_skills.length !== 1 ? 's' : ''} still need improvement
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerReadinessCard;

