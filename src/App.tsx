import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { ContentManagerDashboard } from './components/dashboard/ContentManagerDashboard';
import { CommunityManagerDashboard } from './components/dashboard/CommunityManagerDashboard';
import { ModeratorDashboard } from './components/dashboard/ModeratorDashboard';
import { EventsList } from './components/events/EventsList';
import { EventCreate } from './components/events/EventCreate';
import { EventDetail } from './components/events/EventDetail';
import { CommunitiesList } from './components/communities/CommunitiesList';
import { CommunityCreate } from './components/communities/CommunityCreate';
import { CommunityDetail } from './components/communities/CommunityDetail';
import { TracksList } from './components/tracks/TracksList';
import { TrackCreate } from './components/tracks/TrackCreate';
import { TrackDetail } from './components/tracks/TrackDetail';
import { FeedModeration } from './components/feed/FeedModeration';
import { MarketplaceModeration } from './components/marketplace/MarketplaceModeration';
import { CMS } from './components/cms/CMS';
import { MediaLibrary } from './components/media/MediaLibrary';
import { PushNotifications } from './components/push/PushNotifications';
import { UsersList } from './components/users/UsersList';
import { Reports } from './components/reports/Reports';
import { AppConfig } from './components/config/AppConfig';
import { RolesPermissions } from './components/roles/RolesPermissions';

export type UserRole = 'super-admin' | 'content-manager' | 'community-manager' | 'moderator';

export interface AppState {
  currentRole: UserRole;
  currentPage: string;
  selectedEventId?: string;
  selectedCommunityId?: string;
  selectedTrackId?: string;
  editingCommunity?: any;
}

function DashboardRoutes() {
  const [state, setState] = useState<AppState>({
    currentRole: 'super-admin',
    currentPage: 'dashboard',
  });

  const navigate = (page: string, params?: any) => {
    setState(prev => ({ ...prev, currentPage: page, ...params }));
  };

  const setRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentRole: role, currentPage: 'dashboard' }));
  };

  const renderContent = () => {
    switch (state.currentPage) {
      case 'dashboard':
        switch (state.currentRole) {
          case 'super-admin':
            return <SuperAdminDashboard navigate={navigate} />;
          case 'content-manager':
            return <ContentManagerDashboard navigate={navigate} />;
          case 'community-manager':
            return <CommunityManagerDashboard navigate={navigate} />;
          case 'moderator':
            return <ModeratorDashboard navigate={navigate} />;
        }
        break;
      case 'events':
        return <EventsList navigate={navigate} role={state.currentRole} />;
      case 'event-create':
        return <EventCreate navigate={navigate} />;
      case 'event-detail':
        return <EventDetail eventId={state.selectedEventId || '1'} navigate={navigate} role={state.currentRole} />;
      case 'communities':
        return <CommunitiesList navigate={navigate} role={state.currentRole} />;
      case 'community-create':
        return <CommunityCreate navigate={navigate} editingCommunity={state.editingCommunity} communityId={state.selectedCommunityId} />;
      case 'community-detail':
        return <CommunityDetail communityId={state.selectedCommunityId || '1'} navigate={navigate} />;
      case 'tracks':
        return <TracksList navigate={navigate} role={state.currentRole} />;
      case 'track-create':
        return <TrackCreate navigate={navigate} />;
      case 'track-detail':
        return <TrackDetail trackId={state.selectedTrackId || '1'} navigate={navigate} role={state.currentRole} />;
      case 'feed':
        return <FeedModeration navigate={navigate} />;
      case 'marketplace':
        return <MarketplaceModeration navigate={navigate} />;
      case 'cms':
        return <CMS navigate={navigate} />;
      case 'media':
        return <MediaLibrary navigate={navigate} />;
      case 'push':
        return <PushNotifications navigate={navigate} />;
      case 'users':
        return <UsersList navigate={navigate} role={state.currentRole} />;
      case 'reports':
        return <Reports navigate={navigate} role={state.currentRole} />;
      case 'config':
        return <AppConfig navigate={navigate} />;
      case 'roles':
        return <RolesPermissions navigate={navigate} />;
      default:
        return <SuperAdminDashboard navigate={navigate} />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout
        currentRole={state.currentRole}
        currentPage={state.currentPage}
        navigate={navigate}
        setRole={setRole}
      >
        {renderContent()}
      </Layout>
    </ProtectedRoute>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

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
      
      {/* Protected Routes */}
      <Route 
        path="/*" 
        element={isAuthenticated ? <DashboardRoutes /> : <Navigate to="/login" replace />} 
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
