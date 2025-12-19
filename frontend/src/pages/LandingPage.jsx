import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header with Login/Signup */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="SkillSync Logo" 
                className="h-16 w-16 object-contain"
              />
              <span className="text-2xl font-bold text-gray-900">SkillSync</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-800 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-primary px-6 py-2"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="SkillSync Logo" 
              className="h-48 w-48 md:h-56 md:w-56 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            AI-Powered Personalized
            <span className="text-primary-800 block">Learning Path Generator</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Transform your career with intelligent skill assessment, personalized learning paths, 
            and adaptive AI that evolves with your progress.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Smart Skill Assessment</h3>
              <p className="text-gray-600">
                MCQ-based assessments with weighted scoring to accurately evaluate your skill levels 
                across multiple technologies and domains.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Skill Gap Analysis</h3>
              <p className="text-gray-600">
                Compare your current skills against career requirements with prioritized gap analysis 
                to focus on what matters most.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-3">Personalized Learning Paths</h3>
              <p className="text-gray-600">
                Graph-based algorithm generates optimized weekly learning schedules based on your 
                available time and skill dependencies.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Learning</h3>
              <p className="text-gray-600">
                Learning paths automatically adapt based on your progress. Struggling? We add revision weeks. 
                Excelling? We accelerate your journey.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-3">Explainable AI</h3>
              <p className="text-gray-600">
                Understand why recommendations were made. Every skill suggestion comes with clear, 
                human-readable explanations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3">Career Readiness Score</h3>
              <p className="text-gray-600">
                Track your progress toward your target career with a clear readiness score showing 
                how close you are to your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose SkillSync?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">🎓 Custom AI Engine</h3>
              <p className="text-primary-100">
                Built with custom rule-based algorithms and graph theory. No external AI APIs - 
                your data stays private and recommendations are fully explainable.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">⚡ Real-Time Adaptation</h3>
              <p className="text-primary-100">
                Your learning path evolves with you. As you progress, the AI automatically adjusts 
                timelines and adds revision weeks when needed.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">📚 Curated Resources</h3>
              <p className="text-primary-100">
                Access to real, open-source learning resources including official documentation, 
                free courses, and practice platforms.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">🎯 Career-Focused</h3>
              <p className="text-primary-100">
                Tailored to specific career roles. Set your goal as Software Engineer, Data Scientist, 
                or any tech role, and get personalized recommendations.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">📱 Cross-Platform</h3>
              <p className="text-primary-100">
                Seamless experience across web and mobile. Your progress syncs automatically, 
                learn anywhere, anytime.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">🔒 Privacy First</h3>
              <p className="text-primary-100">
                All AI processing happens locally. Your data never leaves our servers. 
                No third-party AI services, no data sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Set Your Goal</h3>
              <p className="text-gray-600 text-sm">
                Choose your target career role (Software Engineer, Data Scientist, etc.)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Assess Your Skills</h3>
              <p className="text-gray-600 text-sm">
                Take MCQ-based assessments to evaluate your current skill levels
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Your Path</h3>
              <p className="text-gray-600 text-sm">
                Receive a personalized learning path with weekly schedules and resources
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn & Adapt</h3>
              <p className="text-gray-600 text-sm">
                Follow your path, track progress, and watch it adapt to your performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of learners using SkillSync to accelerate their tech career journey.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup" className="btn-primary px-10 py-4 text-lg">
              Start Learning Free
            </Link>
            <Link to="/login" className="btn-secondary px-10 py-4 text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo.png" 
              alt="SkillSync Logo" 
              className="h-14 w-14 object-contain"
            />
            <span className="text-xl font-bold text-white">SkillSync</span>
          </div>
          <p className="text-sm">
            AI-Powered Personalized Learning Path Generator
          </p>
          <p className="text-xs mt-4 text-gray-500">
            © 2024 SkillSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

