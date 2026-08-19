import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
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
import { EASE } from './hooks/useReducedMotion';

const Page = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><LandingPage /></Page>} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/signup" element={<Page><Signup /></Page>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><AppShell><Page><Dashboard /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/assessment"
          element={<ProtectedRoute><AppShell><Page><Assessment /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/assessment/:skillName"
          element={<ProtectedRoute><AppShell><Page><MCQTest /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/assessment-result"
          element={<ProtectedRoute><AppShell><Page><AssessmentResult /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/learning-path"
          element={<ProtectedRoute><AppShell><Page><LearningPath /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><AppShell><Page><Profile /></Page></AppShell></ProtectedRoute>}
        />
        <Route
          path="/coach"
          element={<ProtectedRoute><AppShell><Page><CoachChat /></Page></AppShell></ProtectedRoute>}
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AnimatedRoutes />
            </Router>
          </ToastProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
