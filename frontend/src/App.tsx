import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisasterManagementPage } from './pages/DisasterManagementPage';
import { ReportDisasterPage } from './pages/ReportDisasterPage';
import { ShelterManagementPage } from './pages/ShelterManagementPage';
import { ReliefResourceManagerPage } from './pages/ReliefResourceManagerPage';
import { ResponderAssignmentPage } from './pages/ResponderAssignmentPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Protected Route Wrapper Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route Guard (Redirects away from login if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication state..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* FIRST PAGE IS LOGIN PAGE */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disasters"
        element={
          <ProtectedRoute>
            <DisasterManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportDisasterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shelters"
        element={
          <ProtectedRoute>
            <ShelterManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RESPONDER']}>
            <ReliefResourceManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RESPONDER']}>
            <ResponderAssignmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <AIInsightsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
