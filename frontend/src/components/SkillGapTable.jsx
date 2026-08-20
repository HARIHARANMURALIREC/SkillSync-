import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SkillGapTable = ({ gaps }) => {
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [assessableSkills, setAssessableSkills] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/assessment/skills')
      .then((res) => {
        setAssessableSkills(new Set(res.data.map((s) => s.name)));
      })
      .catch(() => {});
  }, []);

  if (!gaps || gaps.length === 0) {
    return (
      <div className="card panel-glow text-center py-16">
        <p className="text-muted">Set your career goal to see skill gaps.</p>
      </div>
    );
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose border-rose/40 bg-rose/10';
      case 'Medium':
        return 'text-amber border-amber/40 bg-amber/10';
      case 'Low':
        return 'text-muted border-line bg-surface2';
      default:
        return 'text-muted border-line';
    }
  };

  return (
    <div className="card panel-glow overflow-hidden">
      <p className="section-label mb-2">Focus</p>
      <h3 className="text-2xl font-bold mb-6">Skill gaps</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {['Skill', 'Current', 'Target', 'Gap', 'Priority'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap, index) => (
              <React.Fragment key={index}>
                <tr
                  className="border-b border-line/60 hover:bg-surface2/80 cursor-pointer transition-colors"
                  onClick={() => setExpandedSkill(expandedSkill === index ? null : index)}
                >
                  <td className="px-3 py-4 text-sm font-medium text-fg">{gap.skill_name}</td>
                  <td className="px-3 py-4 text-sm text-muted font-mono tabular">{gap.current_level.toFixed(1)}</td>
                  <td className="px-3 py-4 text-sm text-muted font-mono tabular">{gap.target_level.toFixed(1)}</td>
                  <td className="px-3 py-4 text-sm text-accent font-mono tabular">
                    {gap.gap > 0 ? `+${gap.gap.toFixed(1)}` : gap.gap.toFixed(1)}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${getPriorityClass(gap.priority)}`}>
                      {gap.priority}
                    </span>
                  </td>
                </tr>
                {expandedSkill === index && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 bg-accent/5 border-l-2 border-accent">
                      {gap.explanation && gap.explanation.length > 0 && (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Why this gap</p>
                          <ul className="space-y-1 mb-4">
                            {gap.explanation.map((exp, expIdx) => (
                              <li key={expIdx} className="text-sm text-muted">
                                {exp}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {assessableSkills.has(gap.skill_name) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assessment/${encodeURIComponent(gap.skill_name)}`);
                          }}
                          className="btn-secondary text-sm py-2 px-4"
                        >
                          Take assessment
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkillGapTable;
