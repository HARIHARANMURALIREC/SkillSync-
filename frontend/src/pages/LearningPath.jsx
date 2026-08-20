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
  const [teachback, setTeachback] = useState(null);
  const [teachAnswer, setTeachAnswer] = useState('');
  const [teachBusy, setTeachBusy] = useState(false);
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

  const applyProgress = (r) => {
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
  };

  const toggle = async (weekNumber, resourceIndex, completed) => {
    if (completed) {
      try {
        const start = await api.post('/api/teachback/start', {
          week_number: weekNumber,
          resource_index: resourceIndex,
        });
        if (start.data.passed) {
          const r = await api.post('/api/learning-path/progress', {
            week_number: weekNumber,
            resource_index: resourceIndex,
            completed: true,
          });
          applyProgress(r);
          return;
        }
        setTeachAnswer('');
        setTeachback(start.data);
      } catch (e) {
        toastError(getApiErrorMessage(e, 'Could not start teach-back.'));
      }
      return;
    }

    const previous = learningPath;
    setLearningPath((cur) => ({
      ...cur,
      weekly_paths: cur.weekly_paths.map((week) => {
        if (week.week_number !== weekNumber) return week;
        const indices = new Set(week.completed_resources || []);
        indices.delete(resourceIndex);
        return { ...week, completed_resources: Array.from(indices).sort((a, b) => a - b) };
      }),
    }));
    try {
      const r = await api.post('/api/learning-path/progress', {
        week_number: weekNumber,
        resource_index: resourceIndex,
        completed: false,
      });
      applyProgress(r);
    } catch (e) {
      setLearningPath(previous);
      toastError(getApiErrorMessage(e, 'Failed to update progress'));
    }
  };

  const submitTeachback = async () => {
    if (!teachback) return;
    setTeachBusy(true);
    try {
      const res = await api.post('/api/teachback/submit', {
        week_number: teachback.week_number,
        resource_index: teachback.resource_index,
        answer: teachAnswer,
      });
      if (res.data.passed) {
        success('Teach-back passed. Resource counted.');
        setTeachback(null);
        const path = await api.get('/api/learning-path');
        setLearningPath(path.data);
      } else {
        setTeachback({ ...teachback, ...res.data });
        toastError(res.data.miss || 'Not quite — try again.');
      }
    } catch (e) {
      toastError(getApiErrorMessage(e, 'Teach-back failed.'));
    } finally {
      setTeachBusy(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!learningPath) {
    return (
      <EmptyState
        title="No path yet"
        body="Complete assessments, then generate a weekly plan. Resources are AI-picked; you explain each one before it counts."
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
            <ProgressRing value={pct} tone="accent" />
            <span className="absolute inset-0 grid place-items-center font-mono text-sm font-semibold tabular">{pctN}%</span>
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
      <p className="text-xs text-muted">Checking a resource opens a teach-back. It only counts after you explain it.</p>

      {teachback && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bg/85 backdrop-blur-sm p-4">
          <div className="card-glass max-w-lg w-full panel-glow shadow-neon">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent rounded-t-xl" />
            <p className="section-label text-accent">Teach-back</p>
            <h3 className="mt-2 text-2xl font-bold">{teachback.resource_title || 'Explain this'}</h3>
            <p className="mt-3 text-sm text-muted">{teachback.prompt}</p>
            {teachback.miss && <p className="mt-3 text-sm text-rose">{teachback.miss}</p>}
            <textarea
              className="input-field mt-4 min-h-[140px]"
              value={teachAnswer}
              onChange={(e) => setTeachAnswer(e.target.value)}
              placeholder="Four short sentences…"
            />
            <div className="mt-4 flex gap-3">
              <button className="btn-primary" onClick={submitTeachback} disabled={teachBusy}>
                {teachBusy ? 'Scoring…' : 'Submit explanation'}
              </button>
              <button className="btn-secondary" onClick={() => setTeachback(null)} disabled={teachBusy}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {learningPath.weekly_paths.map((week) => {
        const status = week.status || 'pending';
        const isOpen = openWeek === week.week_number;
        return (
          <div
            key={week.week_number}
            className={`card overflow-hidden transition-all ${isOpen ? 'border-accent/40 shadow-neon-sm' : ''}`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenWeek(isOpen ? null : week.week_number)}
            >
              <div>
                <p className="font-mono text-accent font-semibold">Week {week.week_number}</p>
                <h3 className="text-2xl font-bold">{week.skill_name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`chip ${status === 'completed' ? 'chip-teal' : 'chip-muted'}`}>
                  {status.replace('_', ' ')}
                </span>
                <ChevronDown className={`transition text-muted ${isOpen ? 'rotate-180 text-accent' : ''}`} size={18} />
              </div>
            </button>
            {isOpen && (
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
