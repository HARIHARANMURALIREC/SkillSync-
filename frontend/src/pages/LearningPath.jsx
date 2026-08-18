import { useState, useEffect } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import ResourceChecklist from '../components/ResourceChecklist';
import { X } from 'lucide-react';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      const response = await api.get('/api/learning-path');
      setLearningPath(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setLearningPath(null);
      } else {
        console.error('Failed to load learning path:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/api/learning-path/generate');
      setLearningPath(response.data);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
      alert(getApiErrorMessage(error, 'Failed to generate learning path'));
    } finally {
      setGenerating(false);
    }
  };

  const computeSkillProgress = () => {
    if (!learningPath?.weekly_paths) return [];

    const skillTotals = {};
    const skillCompleted = {};

    learningPath.weekly_paths.forEach((week) => {
      const skillKey = week.skill_name.split(' (')[0];
      const completed = week.completed_resources || [];
      const total = week.resources?.length || 0;

      if (!skillTotals[skillKey]) {
        skillTotals[skillKey] = 0;
        skillCompleted[skillKey] = 0;
      }
      skillTotals[skillKey] += total;
      skillCompleted[skillKey] += completed.length;
    });

    return Object.keys(skillTotals).map((skill_name) => ({
      skill_name,
      progress_percentage:
        skillTotals[skill_name] > 0
          ? (skillCompleted[skill_name] / skillTotals[skill_name]) * 100
          : 0,
    }));
  };

  const adaptLearningPath = async () => {
    setAdapting(true);
    try {
      const progressData = computeSkillProgress();

      const response = await api.post('/api/learning-path/adapt', progressData);
      setLearningPath(response.data.adapted_path);
      setToast({
        type: 'success',
        message: 'Learning path updated based on your progress.',
        explanations: response.data.explanation,
      });
      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      console.error('Failed to adapt learning path:', error);
      setToast({
        type: 'error',
        message: getApiErrorMessage(error, 'Failed to adapt learning path'),
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setAdapting(false);
    }
  };

  const handleToggleResource = async (weekNumber, resourceIndex, completed) => {
    setTogglingProgress(true);

    const previousPath = learningPath;
    const optimisticPath = {
      ...learningPath,
      weekly_paths: learningPath.weekly_paths.map((week) => {
        if (week.week_number !== weekNumber) return week;
        const indices = new Set(week.completed_resources || []);
        if (completed) indices.add(resourceIndex);
        else indices.delete(resourceIndex);
        return { ...week, completed_resources: Array.from(indices).sort((a, b) => a - b) };
      }),
    };
    setLearningPath(optimisticPath);

    try {
      const response = await api.post('/api/learning-path/progress', {
        week_number: weekNumber,
        resource_index: resourceIndex,
        completed,
      });

      setLearningPath((current) => {
        if (!current) return current;
        return {
          ...current,
          weekly_paths: current.weekly_paths.map((week) => {
            const weekCompleted = response.data.completed
              .filter((c) => c.week_number === week.week_number)
              .map((c) => c.resource_index);
            const resourceCount = week.resources?.length || 0;
            let status = 'pending';
            if (weekCompleted.length > 0 && weekCompleted.length < resourceCount) {
              status = 'in_progress';
            } else if (resourceCount > 0 && weekCompleted.length >= resourceCount) {
              status = 'completed';
            }
            return {
              ...week,
              completed_resources: weekCompleted,
              status: response.data.week_status[week.week_number] || status,
            };
          }),
        };
      });
    } catch (error) {
      setLearningPath(previousPath);
      setToast({
        type: 'error',
        message: getApiErrorMessage(error, 'Failed to update progress'),
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setTogglingProgress(false);
    }
  };

  const overallCompletion = () => {
    if (!learningPath?.weekly_paths?.length) return { pct: 0, done: 0, total: 0 };
    let done = 0;
    let total = 0;
    learningPath.weekly_paths.forEach((week) => {
      total += week.resources?.length || 0;
      done += (week.completed_resources || []).length;
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { pct, done, total };
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (!learningPath) {
    return (
      <div className="card text-center py-16 max-w-lg mx-auto">
        <p className="page-kicker">Plan</p>
        <h2 className="font-serif text-3xl mb-3">No path yet</h2>
        <p className="text-muted mb-8">
          Complete assessments and set a career goal, then generate a weekly plan.
        </p>
        <button
          onClick={generateLearningPath}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Generating…' : 'Generate learning path'}
        </button>
      </div>
    );
  }

  const completion = overallCompletion();

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`card ${toast.type === 'success' ? 'border-gold/30' : 'border-red-400/30'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={toast.type === 'success' ? 'text-cream' : 'text-red-200'}>
                {toast.message}
              </p>
              {toast.explanations && toast.explanations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {toast.explanations.map((exp, idx) => (
                    <li key={idx} className="text-sm text-muted">
                      {exp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={() => setToast(null)} className="text-muted hover:text-cream">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="card border-gold/20">
        <p className="text-xs uppercase tracking-wider text-muted mb-2">Overall progress</p>
        <div className="flex items-end justify-between gap-4 mb-3">
          <p className="font-serif text-3xl text-cream">{completion.pct}%</p>
          <p className="text-sm text-muted">
            {completion.done} of {completion.total} resources complete
          </p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${completion.pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="page-kicker">Curriculum</p>
          <h1 className="page-title">Learning path</h1>
          <p className="text-muted mt-2">
            {learningPath.total_weeks} weeks of focused work
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={adaptLearningPath}
            disabled={adapting || generating || togglingProgress}
            className="btn-primary"
          >
            {adapting ? 'Adapting…' : 'Adapt path'}
          </button>
          <button
            onClick={generateLearningPath}
            disabled={generating || adapting}
            className="btn-secondary"
          >
            {generating ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {learningPath.weekly_paths.map((week, index) => {
          const statusClass =
            week.status === 'completed'
              ? 'text-gold border-gold/40'
              : week.status === 'in_progress'
                ? 'text-cream border-white/20'
                : 'text-muted border-white/10';

          const weekDone = (week.completed_resources || []).length;
          const weekTotal = week.resources?.length || 0;
          const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

          return (
            <div
              key={index}
              className={`card ${week.is_revised ? 'border-gold/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="font-serif text-2xl">
                    Week {week.week_number}
                    <span className="text-muted font-sans text-base ml-3">{week.skill_name}</span>
                  </h3>
                  <p className="text-sm text-muted mt-2">
                    {week.estimated_hours.toFixed(1)} hours
                    {week.is_revised ? ' · Revised' : ''}
                    {weekTotal > 0 ? ` · ${weekDone}/${weekTotal} resources` : ''}
                  </p>
                  {weekTotal > 0 && (
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-3 max-w-xs">
                      <div
                        className="h-full bg-gold/80 rounded-full transition-all"
                        style={{ width: `${weekPct}%` }}
                      />
                    </div>
                  )}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs border ${statusClass}`}>
                  {week.status.replace('_', ' ')}
                </span>
              </div>

              {week.explanation && week.explanation.length > 0 && (
                <div className="mb-5">
                  <ExplainabilityPanel
                    explanations={week.explanation}
                    title={`Why week ${week.week_number}`}
                  />
                </div>
              )}

              <p className="text-xs uppercase tracking-wider text-muted mb-3">Resources</p>
              {week.resources && week.resources.length > 0 ? (
                <ResourceChecklist
                  weekNumber={week.week_number}
                  resources={week.resources}
                  completedIndices={week.completed_resources || []}
                  onToggle={handleToggleResource}
                  disabled={togglingProgress}
                />
              ) : (
                <p className="text-muted text-sm">No resources assigned for this week.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
