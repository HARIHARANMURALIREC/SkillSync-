import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ExplainabilityPanel from '../components/ExplainabilityPanel';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      const response = await api.get('/api/learning-path');
      setLearningPath(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // No learning path yet
        setLearningPath(null);
      } else {
        console.error('Failed to load learning path:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/api/learning-path/generate');
      setLearningPath(response.data);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
      alert(error.response?.data?.detail || 'Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
  };

  const adaptLearningPath = async () => {
    setAdapting(true);
    try {
      // For demo purposes, simulate progress data
      // In a real app, this would come from user input or tracked progress
      const progressData = learningPath.weekly_paths.map(week => ({
        skill_name: week.skill_name.split(' (')[0], // Remove "(Revision)" suffix if present
        progress_percentage: Math.random() * 100 // Simulated progress
      }));

      const response = await api.post('/api/learning-path/adapt', progressData);
      setLearningPath(response.data.adapted_path);
      setToast({
        type: 'success',
        message: 'Learning path updated based on your performance!',
        explanations: response.data.explanation
      });
      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      console.error('Failed to adapt learning path:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to adapt learning path'
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setAdapting(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (!learningPath) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Learning Path Yet</h2>
        <p className="text-gray-600 mb-6">
          Complete skill assessments and set your career goal to generate a personalized learning path.
        </p>
        <button
          onClick={generateLearningPath}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Generating...' : 'Generate Learning Path'}
        </button>
      </div>
    );
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'course':
        return '📚';
      case 'practice':
        return '💻';
      default:
        return '📖';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`card ${
          toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`font-medium ${
                toast.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toast.message}
              </p>
              {toast.explanations && toast.explanations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {toast.explanations.map((exp, idx) => (
                    <li key={idx} className={`text-sm ${
                      toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      • {exp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setToast(null)}
              className={`ml-4 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Learning Path</h1>
          <p className="text-gray-600 mt-1">
            {learningPath.total_weeks} weeks of personalized learning
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={adaptLearningPath}
            disabled={adapting || generating}
            className="btn-primary"
          >
            {adapting ? 'Adapting...' : 'Adapt Path'}
          </button>
          <button
            onClick={generateLearningPath}
            disabled={generating || adapting}
            className="btn-secondary"
          >
            {generating ? 'Regenerating...' : 'Regenerate Path'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {learningPath.weekly_paths.map((week, index) => (
          <div key={index} className={`card ${week.is_revised ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">
                    Week {week.week_number}: {week.skill_name}
                  </h3>
                  {week.is_revised && (
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">
                      Revised
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  Estimated: {week.estimated_hours.toFixed(1)} hours
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  week.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : week.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {week.status.replace('_', ' ')}
              </span>
            </div>

            {/* Explainability Panel for this week */}
            {week.explanation && week.explanation.length > 0 && (
              <div className="mb-4">
                <ExplainabilityPanel 
                  explanations={week.explanation}
                  title={`Why Week ${week.week_number}?`}
                />
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Learning Resources:</h4>
              {week.resources && week.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {week.resources.map((resource, resIndex) => (
                    <div
                      key={resIndex}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{resource.title}</h5>
                          <p className="text-sm text-gray-500 capitalize mt-1">{resource.type}</p>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-800 hover:text-primary-900 mt-2 inline-block"
                            >
                              Open resource →
                            </a>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {resource.estimated_hours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No resources assigned for this week.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPath;

