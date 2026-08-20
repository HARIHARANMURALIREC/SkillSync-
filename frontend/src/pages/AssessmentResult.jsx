import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import useCountUp from '../hooks/useCountUp';
import { xpFromAssessment } from '../lib/gamification';

const AssessmentResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const recert = state?.recert;
  const elapsed = state?.elapsed || 0;
  const strong = (result?.score || 0) >= 7.5;
  const displayScore = result?.stored_score ?? result?.score;
  const xp = xpFromAssessment(displayScore || 0);
  const xpN = Math.round(useCountUp(xp));

  useEffect(() => {
    if (!result) navigate('/dashboard');
  }, [result, navigate]);

  if (!result) return null;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="relative mx-auto max-w-xl space-y-6">
      <Confetti fire={strong} />
      <div className="card panel-glow text-center py-12">
        <p className="page-kicker justify-center">{recert ? (result.passed ? 'Recert passed' : 'Recert missed') : 'Complete'}</p>
        <h1 className="page-title">{result.skill_name}</h1>
        <div className="relative mx-auto mt-8 w-fit">
          <ProgressRing value={(result.score || 0) * 10} size={140} stroke={10} tone={strong ? 'teal' : 'accent'} />
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-4xl font-bold tabular">{result.score.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-4 chip-gold">{result.level}</p>
        {recert && result.stored_score !== undefined && (
          <p className="mt-3 text-sm text-muted">Stored skill score: {result.stored_score.toFixed(1)}/10</p>
        )}
        <p className="mt-6 font-mono text-2xl font-bold tabular text-accent">+{xpN} XP</p>
        <p className="text-sm text-muted font-mono mt-2 tabular">
          {mins}m {secs}s
        </p>
      </div>
      {result.breakdown && (
        <div className="card panel-glow grid grid-cols-2 gap-4">
          <div><p className="section-label">Questions</p><p className="stat-value">{result.breakdown.total_questions}</p></div>
          <div><p className="section-label">Correct</p><p className="stat-value text-teal">{result.breakdown.correct_answers}</p></div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="btn-secondary" onClick={() => navigate('/assessment')}>Another assessment</button>
        <button className="btn-ghost" onClick={() => navigate('/coach')}>Coach</button>
      </div>
    </div>
  );
};

export default AssessmentResult;
