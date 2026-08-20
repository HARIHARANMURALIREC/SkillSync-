import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api, {
  clearCoachHistory,
  getApiErrorMessage,
  getCoachHistory,
  getWeeklyPlan,
} from '../services/api';

const STARTERS = [
  'What should I focus on this week?',
  'Explain my biggest skill gap',
  'How do I prepare for a reassessment?',
  'Suggest a project to practise with',
];

function Bubble({ content, role }) {
  const lines = (content || '').split('\n');
  return (
    <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
      role === 'user'
        ? 'bg-accent/15 border border-accent/35 text-fg shadow-neon-sm'
        : 'bg-surface2 border border-line text-muted'
    }`}>
      {lines.map((line, i) => {
        const heading = /^(Focus|Plan|Check[-‑]?in|Next)$/i.test(line.trim());
        return (
          <p key={i} className={heading ? 'mt-2 first:mt-0 text-xs font-semibold uppercase tracking-wider text-accent' : 'mt-1'}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

const CoachChat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const starterSent = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [history, plan] = await Promise.all([
          getCoachHistory().catch(() => ({ messages: [] })),
          getWeeklyPlan().catch(() => null),
        ]);
        setMessages(history.messages || []);
        setWeeklyPlan(plan);
      } finally {
        setBooting(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const r = await api.post('/api/chat', { messages: next });
      setMessages([...next, { role: 'assistant', content: r.data.reply }]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Ollama is not running. Start it with `ollama serve`. SkillSync uses the mistral:latest model.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const starter = location.state?.starter;
    if (starter && !booting && !starterSent.current && messages.length === 0) {
      starterSent.current = true;
      send(starter);
    }
  }, [booting, location.state, messages.length]);

  const clearHistory = async () => {
    if (!window.confirm('Clear your coach conversation?')) return;
    try {
      await clearCoachHistory();
      setMessages([]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not clear history.'));
    }
  };

  if (booting) {
    return <p className="text-muted">Loading coach…</p>;
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] max-h-[820px] flex-col">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="page-kicker">Guide</p>
          <h1 className="page-title">AI coach</h1>
          <p className="mt-2 text-muted">Mistral via Ollama on your machine. Plans stay private.</p>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn-secondary inline-flex items-center gap-2 text-sm" onClick={clearHistory}>
            <Trash2 size={14} />
            Clear conversation
          </button>
        )}
      </div>
      {weeklyPlan?.focus && (
        <div className="mb-3 rounded-lg border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-muted">
          <span className="font-medium text-violet">This week:</span> {weeklyPlan.focus}
        </div>
      )}
      <div className="card-glass flex min-h-0 flex-1 flex-col panel-glow">
        <div className="flex-1 space-y-4 overflow-y-auto p-1">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-accent/30 bg-accent/10 shadow-neon-sm">
                <MessageCircle className="text-accent" size={24} />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((p) => (
                  <button key={p} type="button" className="chip-gold hover:shadow-neon-sm transition-shadow text-sm" onClick={() => send(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Bubble {...m} />
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-line bg-surface2 px-4 py-3 text-muted">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet" style={{ animationDelay: '75ms' }} />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" style={{ animationDelay: '150ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <form
          className="flex gap-3 border-t border-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input className="input-field flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your coach…" disabled={loading} />
          <button className="btn-primary px-4" disabled={loading || !input.trim()} type="submit" aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachChat;
