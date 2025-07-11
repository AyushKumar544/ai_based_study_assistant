import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import TargetSetting from './pages/TargetSetting';
import Dashboard from './pages/Dashboard';
import StudyTimer from './pages/StudyTimer';
import Flashcards from './pages/Flashcards';
import Notes from './pages/Notes';
import DrawingBoard from './pages/DrawingBoard';
import Analytics from './pages/Analytics';
import StudyPlan from './pages/StudyPlan';
import MockTests from './pages/MockTests';
import StudyGroups from './pages/StudyGroups';
import Calendar from './pages/Calendar';
import Music from './pages/Music';
import TextSummarizer from './pages/TextSummarizer';
import DoubtSolver from './pages/DoubtSolver';
import CategorySelection from './pages/CategorySelection'; // ✅
import ProfileSetup from './pages/ProfileSetup'; // ✅

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your study assistant...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/category-selection" element={
        <ProtectedRoute>
          <CategorySelection />
        </ProtectedRoute>
      } />

      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />

      <Route path="/target-setting" element={
        <ProtectedRoute>
          <TargetSetting />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/study-timer" element={
        <ProtectedRoute>
          <StudyTimer />
        </ProtectedRoute>
      } />
      <Route path="/flashcards" element={
        <ProtectedRoute>
          <Flashcards />
        </ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute>
          <Notes />
        </ProtectedRoute>
      } />
      <Route path="/drawing-board" element={
        <ProtectedRoute>
          <DrawingBoard />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/study-plan" element={
        <ProtectedRoute>
          <StudyPlan />
        </ProtectedRoute>
      } />
      <Route path="/mock-tests" element={
        <ProtectedRoute>
          <MockTests />
        </ProtectedRoute>
      } />
      <Route path="/study-groups" element={
        <ProtectedRoute>
          <StudyGroups />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      } />
      <Route path="/music" element={
        <ProtectedRoute>
          <Music />
        </ProtectedRoute>
      } />
      <Route path="/text-summarizer" element={
        <ProtectedRoute>
          <TextSummarizer />
        </ProtectedRoute>
      } />
      <Route path="/doubt-solver" element={
        <ProtectedRoute>
          <DoubtSolver />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
