import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="px-6 md:px-10">
        <div className="flex justify-between h-16 items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-muted hover:text-cream hover:bg-white/5"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.6} />
          </button>

          <p className="hidden lg:block text-sm text-muted">
            {user?.career_goal || 'Set a career goal to personalize your path'}
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-cream">
                {user?.full_name || user?.email}
              </p>
              {user?.career_goal && (
                <p className="text-xs text-muted">{user.career_goal}</p>
              )}
            </div>
            <div className="w-9 h-9 rounded-full border border-gold/40 text-gold text-sm flex items-center justify-center">
              {initial}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
