import { useState } from 'react';

const ExplainabilityPanel = ({ explanations, title = "Why this recommendation?" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanations || explanations.length === 0) {
    return null;
  }

  return (
    <div className="card bg-blue-50 border border-blue-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <span className="font-medium text-blue-900">{title}</span>
        </div>
        <span className="text-blue-600">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <ul className="space-y-2">
            {explanations.map((explanation, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                <span className="text-blue-500 mt-1">•</span>
                <span>{explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExplainabilityPanel;

