import { Inbox } from 'lucide-react';

export default function EmptyState({ title, body, action }) {
  return (
    <div className="card text-center py-16">
      <Inbox className="mx-auto mb-4 text-gold" size={28} strokeWidth={1.5} />
      <h3 className="font-serif text-2xl mb-2">{title}</h3>
      {body && <p className="text-muted max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
