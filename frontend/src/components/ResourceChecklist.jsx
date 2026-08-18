import { Check } from 'lucide-react';

const ResourceChecklist = ({
  weekNumber,
  resources,
  completedIndices = [],
  onToggle,
  disabled = false,
}) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {resources.map((resource, index) => {
        const isCompleted = completedIndices.includes(index);
        return (
          <label
            key={index}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
              isCompleted
                ? 'border-gold/30 bg-gold-faint/50'
                : 'border-white/10 hover:border-white/20'
            } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                isCompleted ? 'bg-gold border-gold text-ink' : 'border-white/30'
              }`}
            >
              {isCompleted && <Check size={12} strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={isCompleted}
              disabled={disabled}
              onChange={() => onToggle(weekNumber, index, !isCompleted)}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${isCompleted ? 'text-cream' : 'text-cream/90'}`}>
                {resource.title}
              </p>
              <p className="text-xs text-muted capitalize mt-0.5">
                {resource.type} · {resource.estimated_hours}h
              </p>
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold hover:text-gold-hover mt-2 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open resource
                </a>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default ResourceChecklist;
