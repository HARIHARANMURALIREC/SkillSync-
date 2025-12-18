import React, { useState } from 'react';

const SkillGapTable = ({ gaps }) => {
  const [expandedSkill, setExpandedSkill] = useState(null);

  if (!gaps || gaps.length === 0) {
    return (
      <div className="card text-center text-gray-500 py-12">
        <p>Set your career goal to see skill gaps.</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Skill Gaps</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gap
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gaps.map((gap, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedSkill(expandedSkill === index ? null : index)}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {gap.skill_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {gap.current_level.toFixed(1)}/10
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {gap.target_level.toFixed(1)}/10
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {gap.gap > 0 ? `+${gap.gap.toFixed(1)}` : gap.gap.toFixed(1)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                        gap.priority
                      )}`}
                    >
                      {gap.priority}
                    </span>
                  </td>
                </tr>
                {expandedSkill === index && gap.explanation && gap.explanation.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-blue-50">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-900 mb-2">Explanation:</p>
                        <ul className="space-y-1">
                          {gap.explanation.map((exp, expIdx) => (
                            <li key={expIdx} className="text-sm text-blue-800 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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

