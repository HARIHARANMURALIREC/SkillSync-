import { Inbox } from 'lucide-react';

export default function EmptyState({ title, body, action }) {
  return (
    <div className="card panel-glow text-center py-16">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-accent/30 bg-accent/10 shadow-neon-sm">
        <Inbox className="text-accent" size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      {body && <p className="text-muted max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
