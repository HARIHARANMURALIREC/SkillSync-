import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex">
      <div className="hidden lg:flex w-[42%] border-r border-white/10 px-12 py-12 flex-col justify-between">
        <Link to="/" className="font-serif text-xl text-cream">
          SkillSync
        </Link>
        <div>
          <p className="page-kicker">Get started</p>
          <h1 className="font-serif text-5xl leading-tight">
            Build a path that
            <span className="italic text-gold"> fits your week.</span>
          </h1>
        </div>
        <p className="text-sm text-muted">Assess · Plan · Learn</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-in">
          <Link to="/" className="lg:hidden font-serif text-xl mb-12 inline-block">
            SkillSync
          </Link>

          <h2 className="font-serif text-3xl mb-2">Create account</h2>
          <p className="text-muted text-sm mb-8">A few details. Then your first assessment.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-400/30 bg-red-400/10 text-red-200 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-xs uppercase tracking-wider text-muted mb-2">
                Full name <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="input-field"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-hover">
              Sign in
            </Link>
          </p>

          <Link to="/" className="mt-10 inline-flex items-center gap-2 text-sm text-muted hover:text-cream">
            <ArrowLeft size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
