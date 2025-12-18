import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">SkillSync</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.email}
              </p>
              {user?.career_goal && (
                <p className="text-xs text-gray-500">{user.career_goal}</p>
              )}
            </div>
            <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white font-medium">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

