import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser, login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    career_goal: '',
    hours_per_week: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const careerGoals = [
    'Software Engineer',
    'Data Scientist',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/api/profile');
      const user = response.data;
      setFormData({
        full_name: user.full_name || '',
        career_goal: user.career_goal || '',
        hours_per_week: user.hours_per_week || 10,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/api/profile', formData);
      setMessage('Profile updated successfully!');
      // Refresh user data in context
      if (authUser) {
        const response = await api.get('/api/auth/me');
        // Note: In a real app, you'd update the context properly
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              className="input-field"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="career_goal" className="block text-sm font-medium text-gray-700 mb-2">
              Career Goal
            </label>
            <select
              id="career_goal"
              className="input-field"
              value={formData.career_goal}
              onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
            >
              <option value="">Select a career goal</option>
              {careerGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Setting a career goal helps us generate personalized skill recommendations.
            </p>
          </div>

          <div>
            <label htmlFor="hours_per_week" className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Week Available for Learning
            </label>
            <input
              id="hours_per_week"
              type="number"
              min="1"
              max="40"
              className="input-field"
              value={formData.hours_per_week}
              onChange={(e) =>
                setFormData({ ...formData, hours_per_week: parseInt(e.target.value) || 10 })
              }
            />
            <p className="mt-2 text-sm text-gray-500">
              This helps us plan your learning schedule realistically.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

