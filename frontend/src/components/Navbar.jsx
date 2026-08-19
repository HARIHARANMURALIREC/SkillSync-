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
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl md:px-8">
      <button type="button" className="btn-ghost lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="flex-1 text-sm text-muted">
        {user?.career_goal ? (
          <span>Working toward {user.career_goal}</span>
        ) : (
          <Link to="/profile" className="text-gold">
            Set a career goal
          </Link>
        )}
      </div>
      <span className="chip-muted text-rose hidden sm:inline-flex">
        <Flame size={12} className="mr-1" /> {streakDays}
      </span>
      <span className="chip-gold hidden sm:inline-flex tabular">{Math.round(xp)} XP</span>
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-violet text-sm font-medium text-bg">
          {initial}
        </div>
        <span className="hidden text-xs text-muted md:block">
          Lv {level.level} · {level.title}
        </span>
      </div>
    </header>
  );
}
