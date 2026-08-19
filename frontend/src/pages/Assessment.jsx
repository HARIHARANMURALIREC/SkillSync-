import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

const barTone = (score) => {
  if (score >= 7.5) return 'bg-teal';
  if (score >= 4.5) return 'bg-gold';
  return 'bg-violet';
};

const Assessment = () => {
  const [skills, setSkills] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/api/assessment/skills'),
      api.get('/api/assessment/history').catch(() => ({ data: [] })),
    ])
      .then(([s, h]) => {
        setSkills(s.data);
        setHistory(h.data || []);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <EmptyState title="Could not load skills" body={error} />;
  if (!skills.length) {
    return (
      <EmptyState
        title="No assessments yet"
        body="Set a career goal to see relevant skill assessments."
        action={<button className="btn-primary" onClick={() => navigate('/profile')}>Set career goal</button>}
      />
    );
  }

  const latest = {};
  history.forEach((h) => {
    if (!latest[h.skill_name]) latest[h.skill_name] = h;
  });

  const SkillCard = ({ skill }) => {
    const prev = latest[skill.name];
    return (
      <button
        type="button"
        className="card card-hover text-left"
        onClick={() => navigate(`/assessment/${encodeURIComponent(skill.name)}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl">{skill.name}</h3>
          {skill.recommended && <span className="chip-gold">For your goal</span>}
        </div>
        <p className="mt-2 text-sm text-muted">{skill.question_count} questions</p>
        {prev && (
          <div className="mt-4">
            <span className="chip-muted">{prev.level}</span>
            <div className="mt-2 h-1.5 rounded-full bg-line">
              <div className={`h-full rounded-full ${barTone(prev.score)}`} style={{ width: `${prev.score * 10}%` }} />
            </div>
          </div>
        )}
        <span className="mt-5 inline-flex items-center gap-2 text-sm text-gold">
          <Play size={14} /> {prev ? 'Reassess' : 'Start'}
        </span>
      </button>
    );
  };

  const recommended = skills.filter((s) => s.recommended);
  const other = skills.filter((s) => !s.recommended);

  return (
    <div className="space-y-8">
      <div>
        <p className="page-kicker">Evaluate</p>
        <h1 className="page-title">Skill assessments</h1>
        <p className="mt-3 text-muted max-w-xl">Choose a skill. Your score stays math; coaching comes from local Ollama.</p>
      </div>
      {recommended.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommended.map((s) => <SkillCard key={s.name} skill={s} />)}
        </div>
      )}
      {other.length > 0 && (
        <div>
          <p className="section-label mb-4">Other skills</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {other.map((s) => <SkillCard key={s.name} skill={s} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
