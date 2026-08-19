import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  MessageCircle,
  UserRound,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import LevelChip from './ui/LevelChip';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/learning-path', label: 'Learning path', icon: Map },
  { to: '/coach', label: 'AI coach', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { level } = useProgress();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-bg/60 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-elev lg:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold to-violet text-bg">
            <Sparkles size={16} />
          </div>
          <span className="font-serif text-xl">SkillSync</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-2xl border border-gold/30 bg-gold/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon size={16} className={`relative z-10 ${isActive ? 'text-gold' : ''}`} />
                    <span className={`relative z-10 ${isActive ? 'text-gold' : ''}`}>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-3 px-4 py-5">
          <LevelChip level={level.level} title={level.title} />
          <button
            type="button"
            onClick={logout}
            className="btn-ghost w-full justify-start text-muted hover:text-danger"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
