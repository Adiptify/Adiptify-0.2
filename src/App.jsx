import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { AdaptifyProvider } from './context/AdaptifyContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import MasteryDashboard from './components/dashboard/MasteryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import QuizDashboard from './pages/QuizDashboard';
import QuizPage from './pages/Quiz';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import StudyModules from './pages/StudyModules';
import ConceptLearning from './pages/ConceptLearning';
import SpacedReview from './pages/SpacedReview';
import ExperimentLab from './pages/ExperimentLab';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserPreferences from './pages/UserPreferences';
import EmptyStatePage from './pages/EmptyStatePage';
import GraphExplorer from './components/graph/GraphExplorer';
import AITutorPage from './pages/AITutorPage';
import SubjectCatalog from './pages/SubjectCatalog';
import AITutor from './components/quiz/AITutor';
import { BookOpen, BarChart2, MessageSquare, User, Trophy, GraduationCap, Network, LogOut, Brain, FlaskConical, BarChart3, Sun, Moon, Settings, Library } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useQuiz();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Derive active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/quiz-dashboard' || path.startsWith('/quiz/') || path === '/result') return 'quiz';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/graph') return 'graph';
    if (path === '/modules' || path.startsWith('/concept/')) return 'modules';
    if (path === '/review') return 'review';
    if (path === '/lab') return 'lab';
    if (path === '/analytics') return 'analytics';
    if (path === '/catalog') return 'catalog';
    if (path === '/tutor') return 'tutor';
    if (path === '/settings') return 'settings';
    if (path === '/login') return 'login';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide sidebar on login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      {!isLoginPage && (
        <aside className="w-64 bg-adiptify-navy dark:bg-slate-950 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center font-bold text-adiptify-navy">
              A
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Adiptify</h1>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-4 mb-2">Learning</p>
            <NavItem
              icon={<BarChart2 size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => navigate('/')}
            />
            <NavItem
              icon={<BookOpen size={20} />}
              label="Study Modules"
              active={activeTab === 'modules'}
              onClick={() => navigate('/modules')}
            />
            <NavItem
              icon={<Brain size={20} />}
              label="Spaced Review"
              active={activeTab === 'review'}
              onClick={() => navigate('/review')}
            />
            <NavItem
              icon={<FlaskConical size={20} />}
              label="Experiment Lab"
              active={activeTab === 'lab'}
              onClick={() => navigate('/lab')}
            />
            <NavItem
              icon={<BarChart3 size={20} />}
              label="Analytics"
              active={activeTab === 'analytics'}
              onClick={() => navigate('/analytics')}
            />
            <NavItem
              icon={<MessageSquare size={20} />}
              label="AI Tutor"
              active={activeTab === 'tutor'}
              onClick={() => navigate('/tutor')}
            />
            <NavItem
              icon={<Library size={20} />}
              label="Syllabus & Subjects"
              active={activeTab === 'catalog'}
              onClick={() => navigate('/catalog')}
            />

            <div className="my-3 border-t border-white/10" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-4 mb-2">Assessment</p>

            <NavItem
              icon={<Trophy size={20} />}
              label="Leaderboard"
              active={activeTab === 'leaderboard'}
              onClick={() => navigate('/leaderboard')}
            />

            <div className="my-3 border-t border-white/10" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-4 mb-2">Explore</p>
            <NavItem
              icon={<Network size={20} />}
              label="AI Graph"
              active={activeTab === 'graph'}
              onClick={() => navigate('/graph')}
            />

            <div className="my-3 border-t border-white/10" />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => navigate('/settings')}
            />
          </nav>

          <div className="p-4 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center text-sm font-bold text-adiptify-navy">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400">Student</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/login')}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-adiptify-navy">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Guest</p>
                    <p className="text-xs text-slate-400">Click to Login</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<MasteryDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/modules" element={<EmptyStatePage />} />
          <Route path="/concept/:conceptId" element={<ConceptLearning />} />
          <Route path="/review" element={<EmptyStatePage />} />
          <Route path="/lab" element={<EmptyStatePage />} />
          <Route path="/analytics" element={<EmptyStatePage />} />
          <Route path="/tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
          <Route path="/quiz-dashboard" element={
            <ProtectedRoute><QuizDashboard /></ProtectedRoute>
          } />
          <Route path="/catalog" element={
            <ProtectedRoute><SubjectCatalog /></ProtectedRoute>
          } />
          <Route path="/quiz/:id" element={
            <ProtectedRoute><QuizPage /></ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute><Result /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/settings" element={<UserPreferences />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Tutor */}
      {!isLoginPage && <AITutor />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left ${active
        ? 'bg-adiptify-gold/10 text-adiptify-gold font-medium shadow-sm'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <span className={active ? 'text-adiptify-gold' : 'text-slate-400'}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function App() {
  return (
    <QuizProvider>
      <ThemeProvider>
        <AdaptifyProvider>
          <Router>
            <AppContent />
          </Router>
        </AdaptifyProvider>
      </ThemeProvider>
    </QuizProvider>
  );
}

export default App;
