import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import MCQTest from './pages/MCQTest';
import AssessmentResult from './pages/AssessmentResult';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import CoachChat from './pages/CoachChat';
import { useState } from 'react';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="flex h-screen bg-ink">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Assessment />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:skillName"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MCQTest />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment-result"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AssessmentResult />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-path"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LearningPath />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CoachChat />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
