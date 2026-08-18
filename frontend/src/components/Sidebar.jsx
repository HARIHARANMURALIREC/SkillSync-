import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ClipboardList, Map, UserRound, LogOut, MessageCircle } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/assessment', label: 'Assessment', icon: ClipboardList },
    { path: '/learning-path', label: 'Learning Path', icon: Map },
    { path: '/coach', label: 'Coach', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: UserRound },
  ];

  const isActive = (path) => {
    if (path === '/assessment') {
      return location.pathname === '/assessment' || location.pathname.startsWith('/assessment/');
    }
    return location.pathname === path;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-ink border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-7 border-b border-white/10">
            <Link to="/dashboard" className="font-serif text-xl text-cream tracking-tight" onClick={onClose}>
              SkillSync
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-gold-faint text-gold'
                      : 'text-muted hover:text-cream hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  <span className={active ? 'font-medium' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-cream hover:bg-white/5 transition-colors"
            >
              <LogOut size={18} strokeWidth={1.6} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
