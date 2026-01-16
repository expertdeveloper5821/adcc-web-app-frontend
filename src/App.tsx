import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';


export type UserRole = 'super-admin' | 'content-manager' | 'community-manager' | 'moderator';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login when user becomes unauthenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#C12D32' }}></div>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              onSwitchToRegister={() => navigate('/register')} 
              onLoginSuccess={() => navigate('/dashboard')} 
            />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register 
              onSwitchToLogin={() => navigate('/login')} 
              onRegisterSuccess={() => navigate('/dashboard')} 
            />
          )
        } 
      />
      
      {/* Protected Routes - All routes are handled in Layout component */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
