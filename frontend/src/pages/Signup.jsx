import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup(email, password, fullName);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Signup failed');
  };

  return (
    <AuthShell kicker="Get started" title="Build a path that" accent="fits your week.">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <Link to="/" className="lg:hidden font-serif text-xl mb-4 inline-block">SkillSync</Link>
        <h2 className="font-serif text-3xl">Create account</h2>
        {error && <div className="animate-shake rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <div>
          <label className="label">Full name</label>
          <input className="input-field mt-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-field mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input-field mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Create account'}</button>
        <p className="text-sm text-muted">Already have an account? <Link to="/login" className="text-gold">Sign in</Link></p>
      </form>
    </AuthShell>
  );
};

export default Signup;
