import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const GOALS = [
  'Software Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
];

const pace = (h) => {
  if (h <= 5) return 'Light';
  if (h <= 10) return 'Steady';
  if (h <= 18) return 'Focused';
  return 'Intensive';
};

const Profile = () => {
  const [form, setForm] = useState({ full_name: '', career_goal: '', hours_per_week: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/profile').then((r) => {
      setForm({
        full_name: r.data.full_name || '',
        career_goal: r.data.career_goal || '',
        hours_per_week: r.data.hours_per_week || 10,
      });
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/profile', form);
      success('Profile saved.');
      navigate('/dashboard');
    } catch {
      error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="page-kicker">Account</p>
        <h1 className="page-title">Profile</h1>
      </div>
      <form onSubmit={save} className="space-y-8">
        <div>
          <label className="label">Full name</label>
          <input className="input-field mt-2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <p className="label mb-3">Career goal</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setForm({ ...form, career_goal: goal })}
                className={`card text-left ${form.career_goal === goal ? 'border-gold' : ''}`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="label">Hours per week</label>
            <span className="chip-gold">{pace(form.hours_per_week)} · {form.hours_per_week}h</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            className="mt-4 w-full accent-[rgb(var(--gold))]"
            value={form.hours_per_week}
            onChange={(e) => setForm({ ...form, hours_per_week: Number(e.target.value) })}
          />
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
};

export default Profile;
