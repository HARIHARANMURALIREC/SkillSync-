const ProgressCards = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const pathPct = summary.path_completion_pct ?? 0;
  const pathDetail =
    summary.total_resources > 0
      ? `${summary.resources_completed || 0}/${summary.total_resources} resources`
      : 'No path yet';

  const cards = [
    { title: 'Assessments', value: summary.total_assessments || 0 },
    { title: 'Skills assessed', value: summary.skills_assessed || 0 },
    { title: 'Path completion', value: `${pathPct}%`, subtitle: pathDetail },
    { title: 'High priority gaps', value: summary.gap_summary?.high_priority_gaps || 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card">
          <p className="text-xs uppercase tracking-wider text-muted mb-3">{card.title}</p>
          <p className="font-serif text-3xl text-cream">{card.value}</p>
          {card.subtitle && (
            <p className="text-xs text-muted mt-2">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressCards;
