import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';

const STARTERS = [
  'What should I focus on this week?',
  'Explain my biggest skill gap',
  'How do I prepare for a reassessment?',
  'Suggest a project to practise with',
];

function Bubble({ content, role }) {
  const lines = (content || '').split('\n');
  return (
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
      role === 'user' ? 'bg-gold/20 border border-gold/30 text-fg' : 'bg-surface2 border border-line text-muted'
    }`}>
      {lines.map((line, i) => {
        const heading = /^(Focus|Plan|Check[-‑]?in|Next)$/i.test(line.trim());
        return (
          <p key={i} className={heading ? 'mt-2 first:mt-0 text-xs uppercase tracking-wider text-gold' : 'mt-1'}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

const CoachChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

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

  return (
    <div className="flex h-[calc(100vh-9rem)] max-h-[820px] flex-col">
      <div className="mb-4">
        <p className="page-kicker">Guide</p>
        <h1 className="page-title">AI coach</h1>
        <p className="mt-2 text-muted">Mistral via Ollama on your machine. Plans stay private.</p>
      </div>
      <div className="card flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-1">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <MessageCircle className="mx-auto mb-4 text-gold" />
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((p) => (
                  <button key={p} type="button" className="btn-secondary text-sm" onClick={() => send(p)}>
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
              <div className="rounded-2xl border border-line bg-surface2 px-4 py-3 text-muted">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-75" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-150" />
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
