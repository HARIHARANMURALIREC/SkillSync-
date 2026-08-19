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
  const elapsed = state?.elapsed || 0;
  const strong = (result?.score || 0) >= 7.5;
  const xp = xpFromAssessment(result?.score || 0);
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
      <div className="card text-center py-12">
        <p className="page-kicker justify-center">Complete</p>
        <h1 className="page-title">{result.skill_name}</h1>
        <div className="relative mx-auto mt-8 w-fit">
          <ProgressRing value={result.score * 10} size={140} stroke={10} tone={strong ? 'teal' : 'gold'} />
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-serif text-4xl tabular">{result.score.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-4 chip-gold">{result.level}</p>
        <p className="mt-6 font-serif text-2xl tabular text-gold">+{xpN} XP</p>
        <p className="text-sm text-muted font-mono mt-2">
          {mins}m {secs}s
        </p>
      </div>
      {result.breakdown && (
        <div className="card grid grid-cols-2 gap-4">
          <div><p className="section-label">Questions</p><p className="font-serif text-2xl">{result.breakdown.total_questions}</p></div>
          <div><p className="section-label">Correct</p><p className="font-serif text-2xl">{result.breakdown.correct_answers}</p></div>
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
