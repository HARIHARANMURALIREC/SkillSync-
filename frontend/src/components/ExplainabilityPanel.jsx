import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ExplainabilityPanel = ({ explanations, title = 'Why this recommendation?' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanations || explanations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-surface2 p-5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm text-fg">{title}</span>
        {isExpanded ? (
          <ChevronDown size={16} className="text-muted" />
        ) : (
          <ChevronRight size={16} className="text-muted" />
        )}
      </button>

      {isExpanded && (
        <ul className="mt-4 pt-4 border-t border-line space-y-2">
          {explanations.map((explanation, index) => (
            <li key={index} className="text-sm text-muted leading-relaxed">
              {explanation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExplainabilityPanel;
