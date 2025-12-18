const ProgressCards = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: 'Assessments',
      value: summary.total_assessments || 0,
      icon: '📊',
      color: 'bg-blue-500',
    },
    {
      title: 'Skills Assessed',
      value: summary.skills_assessed || 0,
      icon: '🎯',
      color: 'bg-green-500',
    },
    {
      title: 'High Priority Gaps',
      value: summary.gap_summary?.high_priority_gaps || 0,
      icon: '⚠️',
      color: 'bg-red-500',
    },
    {
      title: 'Total Gap Points',
      value: summary.gap_summary?.total_gap_points?.toFixed(1) || '0.0',
      icon: '📈',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressCards;

