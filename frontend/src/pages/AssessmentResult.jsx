import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AssessmentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/dashboard');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-4">Assessment Complete!</h1>
        <div className="mb-6">
          <p className="text-lg text-gray-600 mb-2">Skill: {result.skill_name}</p>
          <div className="inline-block">
            <span className={`px-4 py-2 rounded-full font-semibold ${getLevelColor(result.level)}`}>
              {result.level}
            </span>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-5xl font-bold text-primary-800 mb-2">
            {result.score.toFixed(1)}/10
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 max-w-md mx-auto">
            <div
              className="bg-primary-800 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(result.score / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {result.breakdown && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Detailed Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold">{result.breakdown.total_questions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold">{result.breakdown.correct_answers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
              <p className="text-2xl font-bold">{result.breakdown.overall_accuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold">{result.breakdown.score.toFixed(1)}/10</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/assessment')}
          className="btn-secondary"
        >
          Take Another Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentResult;

