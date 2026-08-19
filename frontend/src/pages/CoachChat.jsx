import { useState, useRef, useEffect } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { Send, MessageCircle } from 'lucide-react';

const STARTER_PROMPTS = [
  'What should I focus on this week?',
  'Explain my biggest skill gap',
  'How do I prepare for a reassessment?',
];

function CoachMessage({ content, className }) {
  const lines = (content || '').split('\n');
  return (
    <div className={`${className} whitespace-pre-wrap`}>
      {lines.map((line, i) => {
        const isHeading = /^(Focus|Plan|Check[-‑]?in|Next)$/i.test(line.trim());
        return (
          <p
            key={i}
            className={
              isHeading
                ? 'mt-3 first:mt-0 text-xs uppercase tracking-wider text-gold'
                : line.trim()
                  ? 'mt-1'
                  : 'h-2'
            }
          >
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

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMessage = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/chat', { messages: nextMessages });
      setMessages([...nextMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to get a response from the coach.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[720px]">
      <div className="mb-6">
        <p className="page-kicker">Guide</p>
        <h1 className="page-title">Career coach</h1>
        <p className="mt-3 text-muted max-w-xl">
          Ask about your gaps, learning path, and next steps. Groq primary, Ollama fallback.
        </p>
      </div>

      <div className="card flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 p-1 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={32} className="mx-auto text-gold/60 mb-4" strokeWidth={1.5} />
              <p className="text-muted text-sm mb-6">Start a conversation or pick a prompt:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <CoachMessage
                content={msg.content}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold text-ink'
                    : 'bg-white/5 border border-white/10 text-cream'
                }`}
              />
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-muted">
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="text-red-300 text-sm mb-3">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 border-t border-white/10 pt-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach…"
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-4"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachChat;
