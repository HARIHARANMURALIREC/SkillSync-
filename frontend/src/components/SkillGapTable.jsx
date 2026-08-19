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
      <div className="card text-center py-16">
        <p className="text-muted">Set your career goal to see skill gaps.</p>
      </div>
    );
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-gold border-gold/40';
      case 'Medium':
        return 'text-fg/80 border-line';
      case 'Low':
        return 'text-muted border-white/10';
      default:
        return 'text-muted border-white/10';
    }
  };

  return (
    <div className="card overflow-hidden">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Focus</p>
      <h3 className="font-serif text-2xl mb-6">Skill gaps</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {['Skill', 'Current', 'Target', 'Gap', 'Priority'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
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
                  className="border-b border-line/60 hover:bg-surface2 cursor-pointer"
                  onClick={() => setExpandedSkill(expandedSkill === index ? null : index)}
                >
                  <td className="px-3 py-4 text-sm text-fg">{gap.skill_name}</td>
                  <td className="px-3 py-4 text-sm text-muted">{gap.current_level.toFixed(1)}</td>
                  <td className="px-3 py-4 text-sm text-muted">{gap.target_level.toFixed(1)}</td>
                  <td className="px-3 py-4 text-sm text-fg">
                    {gap.gap > 0 ? `+${gap.gap.toFixed(1)}` : gap.gap.toFixed(1)}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityClass(gap.priority)}`}>
                      {gap.priority}
                    </span>
                  </td>
                </tr>
                {expandedSkill === index && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 bg-gold/10">
                      {gap.explanation && gap.explanation.length > 0 && (
                        <>
                          <p className="text-xs uppercase tracking-wider text-gold mb-2">Why this gap</p>
                          <ul className="space-y-1 mb-4">
                            {gap.explanation.map((exp, expIdx) => (
                              <li key={expIdx} className="text-sm text-fg/80">
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
