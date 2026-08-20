import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api, { getApiErrorMessage } from '../services/api';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { EASE } from '../hooks/useReducedMotion';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MCQTest = () => {
  const { skillName } = useParams();
  const [params] = useSearchParams();
  const recert = params.get('recert') === '1';
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    api.get(`/api/assessment/questions/${skillName}${recert ? '?recert=true' : ''}`)
      .then((r) => setQuestions(r.data))
      .finally(() => setLoading(false));
  }, [skillName, recert]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const q = questions[current];
      if (!q) return;
      const idx = LETTERS.indexOf(e.key.toUpperCase());
      if (idx >= 0 && q.options[idx]) setAnswers((a) => ({ ...a, [q.id]: q.options[idx].id }));
      if (e.key === 'ArrowRight' && current < questions.length - 1) {
        setDir(1);
        setCurrent((c) => c + 1);
      }
      if (e.key === 'ArrowLeft' && current > 0) {
        setDir(-1);
        setCurrent((c) => c - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [questions, current]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const endpoint = recert ? '/api/assessment/recert' : '/api/assessment/submit';
      const response = await api.post(endpoint, { skill_name: skillName, answers });
      navigate('/assessment-result', { state: { result: response.data, elapsed, recert } });
    } catch (err) {
      toastError(getApiErrorMessage(err, 'Failed to submit assessment.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!questions.length) return <div className="card panel-glow">No questions for this skill.</div>;

  const question = questions[current];
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="mx-auto max-w-2xl">
      <p className="page-kicker">{recert ? `Recert · ${skillName}` : skillName}</p>
      <div className="mb-4 flex justify-between font-mono text-sm text-muted">
        <span>{current + 1} / {questions.length}</span>
        <span className="tabular text-accent">{mins}:{secs}</span>
      </div>
      <div className="mb-6 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-violet shadow-neon-sm transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: dir * 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -32 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="card panel-glow"
        >
          <h2 className="text-2xl font-bold mb-6">{question.question_text}</h2>
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [question.id]: option.id })}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all active:scale-[0.99] ${
                    selected
                      ? 'border-accent/60 bg-accent/10 shadow-neon-sm'
                      : 'border-line hover:border-accent/40'
                  }`}
                >
                  <span className="font-mono font-semibold text-accent">{LETTERS[i]}</span>
                  {option.text}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between">
            <button
              className="btn-secondary"
              disabled={current === 0}
              onClick={() => {
                setDir(-1);
                setCurrent((c) => c - 1);
              }}
            >
              Previous
            </button>
            {current === questions.length - 1 ? (
              <button className="btn-primary" onClick={submit} disabled={submitting || Object.keys(answers).length < questions.length}>
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => {
                  setDir(1);
                  setCurrent((c) => c + 1);
                }}
              >
                Next
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MCQTest;
