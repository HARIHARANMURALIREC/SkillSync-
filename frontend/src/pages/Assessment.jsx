import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Assessment = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/api/assessment/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (skills.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">
          No assessments available. Please set your career goal in your profile to see relevant skill assessments.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="btn-primary"
        >
          Set Career Goal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Skill Assessments</h1>
        <p className="text-gray-600">
          Choose a skill to assess your current level. This helps us create a personalized learning path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/assessment/${skill}`)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{skill}</h3>
              <span className="text-2xl">→</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Click to start assessment</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessment;

