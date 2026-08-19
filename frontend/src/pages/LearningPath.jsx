import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import ResourceChecklist from '../components/ResourceChecklist';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { useToast } from '../context/ToastContext';
import useCountUp from '../hooks/useCountUp';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [openWeek, setOpenWeek] = useState(1);
  const [celebrate, setCelebrate] = useState(false);
  const { success, error: toastError } = useToast();
  const completionPct = (() => {
    if (!learningPath?.weekly_paths) return 0;
    let done = 0;
    let total = 0;
    learningPath.weekly_paths.forEach((w) => {
      total += w.resources?.length || 0;
      done += (w.completed_resources || []).length;
    });
    return total ? Math.round((done / total) * 100) : 0;
  })();
  const pctN = Math.round(useCountUp(completionPct));

  useEffect(() => {
    api
      .get('/api/learning-path')
      .then((r) => setLearningPath(r.data))
      .catch((e) => {
        if (e.response?.status !== 404) toastError(getApiErrorMessage(e));
      })
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await api.post('/api/learning-path/generate');
      setLearningPath(r.data);
      success('Weekly path generated locally.');
    } catch (e) {
      toastError(getApiErrorMessage(e, 'Failed to generate learning path'));
    } finally {
      setGenerating(false);
    }
  };

  const adapt = async () => {
    setAdapting(true);
    try {
      const progressData = (learningPath?.weekly_paths || []).map((week) => ({
        skill_name: week.skill_name.split(' (')[0],
        progress_percentage:
          week.resources?.length
            ? ((week.completed_resources || []).length / week.resources.length) * 100
            : 0,
      }));
      const r = await api.post('/api/learning-path/adapt', progressData);
      setLearningPath(r.data.adapted_path);
      success('Path adapted to your pace.');
    } catch (e) {
      toastError(getApiErrorMessage(e, 'Failed to adapt learning path'));
    } finally {
      setAdapting(false);
    }
  };

  const toggle = async (weekNumber, resourceIndex, completed) => {
    const previous = learningPath;
    setLearningPath((cur) => ({
      ...cur,
      weekly_paths: cur.weekly_paths.map((week) => {
        if (week.week_number !== weekNumber) return week;
        const indices = new Set(week.completed_resources || []);
        if (completed) indices.add(resourceIndex);
        else indices.delete(resourceIndex);
        return { ...week, completed_resources: Array.from(indices).sort((a, b) => a - b) };
      }),
    }));
    try {
      const r = await api.post('/api/learning-path/progress', {
        week_number: weekNumber,
        resource_index: resourceIndex,
        completed,
      });
      setLearningPath((cur) => {
        const next = {
          ...cur,
          weekly_paths: cur.weekly_paths.map((week) => {
            const weekCompleted = r.data.completed
              .filter((c) => c.week_number === week.week_number)
              .map((c) => c.resource_index);
            const resourceCount = week.resources?.length || 0;
            let status = 'pending';
            if (weekCompleted.length && weekCompleted.length < resourceCount) status = 'in_progress';
            if (resourceCount && weekCompleted.length >= resourceCount) status = 'completed';
            return {
              ...week,
              completed_resources: weekCompleted,
              status: r.data.week_status[week.week_number] || status,
            };
          }),
        };
        const done = next.weekly_paths.every(
          (w) => (w.completed_resources || []).length >= (w.resources?.length || 0) && (w.resources?.length || 0) > 0
        );
        if (done) setCelebrate(true);
        return next;
      });
    } catch (e) {
      setLearningPath(previous);
      toastError(getApiErrorMessage(e, 'Failed to update progress'));
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!learningPath) {
    return (
      <EmptyState
        title="No path yet"
        body="Complete assessments, then generate a weekly plan. Ollama drafts the weeks; links come from a catalog."
        action={
          <button className="btn-primary" onClick={generate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate learning path'}
          </button>
        }
      />
    );
  }

  let done = 0;
  let total = 0;
  learningPath.weekly_paths.forEach((w) => {
    total += w.resources?.length || 0;
    done += (w.completed_resources || []).length;
  });
  const pct = completionPct;

  return (
    <div className="relative space-y-8">
      <Confetti fire={celebrate} />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="page-kicker">Curriculum</p>
          <h1 className="page-title">Learning path</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProgressRing value={pct} />
            <span className="absolute inset-0 grid place-items-center font-serif tabular">{pctN}%</span>
          </div>
          <p className="text-sm text-muted tabular">{done} of {total} resources</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={adapt} disabled={adapting || generating}>
          {adapting ? 'Adapting…' : 'Adapt path'}
        </button>
        <button className="btn-secondary" onClick={generate} disabled={generating}>
          {generating ? 'Generating…' : 'Regenerate'}
        </button>
      </div>
      <p className="text-xs text-muted">Generate and adapt use local Ollama (mistral:latest) when the model is running.</p>

      {learningPath.weekly_paths.map((week) => {
        const status = week.status || 'pending';
        return (
          <div key={week.week_number} className="card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenWeek(openWeek === week.week_number ? null : week.week_number)}
            >
              <div>
                <p className="font-mono text-gold">Week {week.week_number}</p>
                <h3 className="font-serif text-2xl">{week.skill_name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="chip-muted">{status.replace('_', ' ')}</span>
                <ChevronDown className={`transition ${openWeek === week.week_number ? 'rotate-180' : ''}`} size={18} />
              </div>
            </button>
            {openWeek === week.week_number && (
              <div className="mt-6 border-t border-line pt-4">
                <ResourceChecklist
                  weekNumber={week.week_number}
                  resources={week.resources}
                  completedIndices={week.completed_resources || []}
                  onToggle={toggle}
                />
                <div className="mt-4">
                  <ExplainabilityPanel explanations={week.explanation} title="Why this week" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningPath;
