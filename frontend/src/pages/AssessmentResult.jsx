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

  const getLevelClass = (level) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return 'text-gold border-gold/40';
      case 'intermediate':
        return 'text-cream border-white/20';
      default:
        return 'text-muted border-white/10';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card text-center py-12">
        <p className="page-kicker">Complete</p>
        <h1 className="font-serif text-4xl mb-4">Assessment finished</h1>
        <p className="text-muted mb-6">{result.skill_name}</p>
        <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getLevelClass(result.level)}`}>
          {result.level}
        </span>
        <div className="mt-10">
          <div className="font-serif text-6xl text-gold mb-4">
            {result.score.toFixed(1)}
            <span className="text-2xl text-muted"> / 10</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 max-w-xs mx-auto">
            <div
              className="bg-gold h-1 rounded-full transition-all duration-500"
              style={{ width: `${(result.score / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {result.breakdown && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Breakdown</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-1">Questions</p>
              <p className="font-serif text-3xl">{result.breakdown.total_questions}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-1">Correct</p>
              <p className="font-serif text-3xl">{result.breakdown.correct_answers}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-1">Accuracy</p>
              <p className="font-serif text-3xl">{result.breakdown.overall_accuracy}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-1">Score</p>
              <p className="font-serif text-3xl">{result.breakdown.score.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {result.breakdown?.feedback && (
        <div className="card border-gold/20">
          <p className="text-xs uppercase tracking-wider text-gold mb-3">AI feedback</p>
          <p className="text-cream/90 leading-relaxed">{result.breakdown.feedback}</p>
        </div>
      )}

      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Dashboard
        </button>
        <button onClick={() => navigate('/coach')} className="btn-secondary">
          Ask your coach
        </button>
        <button onClick={() => navigate('/assessment')} className="btn-secondary">
          Another assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentResult;
