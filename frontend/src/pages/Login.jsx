import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Login failed');
  };

  return (
    <AuthShell kicker="Welcome back" title="Continue where you" accent="left off.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Link to="/" className="lg:hidden font-display text-xl font-bold mb-4 inline-block">SkillSync</Link>
        <h2 className="text-2xl font-bold">Sign in</h2>
        {error && <div className="animate-shake rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input-field mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input-field mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-sm text-muted">No account? <Link to="/signup" className="text-accent hover:underline">Create one</Link></p>
      </form>
    </AuthShell>
  );
};

export default Login;
