import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
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
      if (authUser) {
        await api.get('/api/auth/me');
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
      <div className="card animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="page-kicker">Account</p>
      <h1 className="page-title mb-8">Profile</h1>

      <div className="card">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm ${
              message.includes('success')
                ? 'border border-gold/30 text-gold'
                : 'border border-red-400/30 text-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-xs uppercase tracking-wider text-muted mb-2">
              Full name
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
            <label htmlFor="career_goal" className="block text-xs uppercase tracking-wider text-muted mb-2">
              Career goal
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
            <p className="mt-2 text-sm text-muted">
              Used to generate skill targets and weekly plans.
            </p>
          </div>

          <div>
            <label htmlFor="hours_per_week" className="block text-xs uppercase tracking-wider text-muted mb-2">
              Hours per week
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
            <p className="mt-2 text-sm text-muted">
              Keeps the weekly plan realistic.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
