import { Link } from 'react-router-dom';
import { Flame, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import ThemeToggle from './ui/ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { level, xp, streakDays } = useProgress();
  const initial = (user?.full_name || user?.email || 'S').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl md:px-8">
      <button type="button" className="btn-ghost lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="flex-1 truncate text-sm text-muted">
        {user?.career_goal ? (
          <span>Working toward <span className="text-fg">{user.career_goal}</span></span>
        ) : (
          <Link to="/profile" className="text-accent hover:underline">
            Set a career goal
          </Link>
        )}
      </div>
      <span className="chip border-rose/40 bg-rose/10 text-rose hidden sm:inline-flex shadow-[0_0_10px_rgb(var(--rose)/0.25)]">
        <Flame size={12} className="mr-1" /> {streakDays}
      </span>
      <span className="chip-gold hidden sm:inline-flex tabular font-mono">{Math.round(xp)} XP</span>
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-violet text-sm font-semibold text-bg shadow-neon-sm">
          {initial}
        </div>
        <span className="hidden text-xs text-muted md:block">
          Lv {level.level} · {level.title}
        </span>
      </div>
    </header>
  );
}
