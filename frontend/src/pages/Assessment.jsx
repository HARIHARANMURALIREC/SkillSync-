import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ArrowUpRight, Star } from 'lucide-react';

const Assessment = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/api/assessment/skills');
      setSkills(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError(getApiErrorMessage(err, 'Failed to load assessments.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (error) {
    return (
      <div className="card text-center py-16">
        <p className="text-red-300 mb-6">{error}</p>
        <button onClick={fetchSkills} className="btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="card text-center py-16 max-w-lg mx-auto">
        <h1 className="font-serif text-3xl mb-3">No assessments yet</h1>
        <p className="text-muted mb-8">
          Set a career goal in your profile to see relevant skill assessments.
        </p>
        <button onClick={() => navigate('/profile')} className="btn-primary">
          Set career goal
        </button>
      </div>
    );
  }

  const recommended = skills.filter((s) => s.recommended);
  const other = skills.filter((s) => !s.recommended);

  const SkillCard = ({ skill }) => (
    <button
      key={skill.name}
      type="button"
      className="card text-left hover:border-gold/40 transition-colors group"
      onClick={() => navigate(`/assessment/${encodeURIComponent(skill.name)}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl flex items-center gap-2">
            {skill.name}
            {skill.recommended && (
              <Star size={14} className="text-gold fill-gold/30" />
            )}
          </h3>
          <p className="text-sm text-muted mt-3">
            {skill.question_count} questions
          </p>
        </div>
        <ArrowUpRight size={18} className="text-muted group-hover:text-gold shrink-0" />
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="page-kicker">Evaluate</p>
        <h1 className="page-title">Skill assessments</h1>
        <p className="mt-3 text-muted max-w-xl">
          Choose a skill. Your score stays math; coaching comes from local Ollama.
        </p>
      </div>

      {recommended.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-gold">Recommended for your goal</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((skill) => <SkillCard key={skill.name} skill={skill} />)}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div className="space-y-4">
          {recommended.length > 0 && (
            <p className="text-xs uppercase tracking-wider text-muted">Other skills</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {other.map((skill) => <SkillCard key={skill.name} skill={skill} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
