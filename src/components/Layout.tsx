import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../App';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SuperAdminDashboard } from './dashboard/SuperAdminDashboard';
import { ContentManagerDashboard } from './dashboard/ContentManagerDashboard';
import { CommunityManagerDashboard } from './dashboard/CommunityManagerDashboard';
import { ModeratorDashboard } from './dashboard/ModeratorDashboard';
import { EventsList } from './events/EventsList';
import { EventCreate } from './events/EventCreate';
import { EventDetail } from './events/EventDetail';
import { EventEdit } from './events/EventEdit';
import { CommunitiesList } from './communities/CommunitiesList';
import { CommunityCreate } from './communities/CommunityCreate';
import { CommunityDetail } from './communities/CommunityDetail';
import { CommunityEdit } from './communities/CommunityEdit';
import { TracksList } from './tracks/TracksList';
import { TrackCreate } from './tracks/TrackCreate';
import { TrackDetail } from './tracks/TrackDetail';
import { FeedModeration } from './feed/FeedModeration';
import { MarketplaceModeration } from './marketplace/MarketplaceModeration';
import { CMS } from './cms/CMS';
import { MediaLibrary } from './media/MediaLibrary';
import { PushNotifications } from './push/PushNotifications';
import { UsersList } from './users/UsersList';
import { Reports } from './reports/Reports';
import { AppConfig } from './config/AppConfig';
import { RolesPermissions } from './roles/RolesPermissions';

export function Layout() {
  const [currentRole, setCurrentRole] = useState<UserRole>('super-admin');
  const location = useLocation();
  
  // Extract current page from pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/events')) return 'events';
    if (path.startsWith('/communities')) return 'communities';
    if (path.startsWith('/tracks')) return 'tracks';
    if (path.startsWith('/feed')) return 'feed';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/cms')) return 'cms';
    if (path.startsWith('/media')) return 'media';
    if (path.startsWith('/push')) return 'push';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/config')) return 'config';
    if (path.startsWith('/roles')) return 'roles';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <TopBar currentRole={currentRole} setRole={setCurrentRole} />
      <div className="flex">
        <Sidebar currentRole={currentRole} currentPage={currentPage} />
        <main className="flex-1 p-8 ml-64 mt-16">
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              currentRole === 'super-admin' ? <SuperAdminDashboard /> :
              currentRole === 'content-manager' ? <ContentManagerDashboard /> :
              currentRole === 'community-manager' ? <CommunityManagerDashboard /> :
              <ModeratorDashboard />
            } />
            
            {/* Events Routes */}
            <Route path="/events" element={<EventsList role={currentRole} />} />
            <Route path="/events/create" element={<EventCreate />} />
            <Route path="/events/:id/edit" element={<EventEdit role={currentRole} />} />
            <Route path="/events/:id" element={<EventDetail role={currentRole} />} />
            
            {/* Communities Routes */}
            <Route path="/communities" element={<CommunitiesList role={currentRole} />} />
            <Route path="/communities/create" element={<CommunityCreate />} />
            <Route path="/communities/:id/edit" element={<CommunityEdit />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            
            {/* Tracks Routes */}
            <Route path="/tracks" element={<TracksList role={currentRole} />} />
            <Route path="/tracks/create" element={<TrackCreate />} />
            <Route path="/tracks/:id" element={<TrackDetail role={currentRole} />} />
            
            {/* Other Routes */}
            <Route path="/feed" element={<FeedModeration />} />
            <Route path="/marketplace" element={<MarketplaceModeration />} />
            <Route path="/cms" element={<CMS />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/push" element={<PushNotifications />} />
            <Route path="/users" element={<UsersList role={currentRole} />} />
            <Route path="/reports" element={<Reports role={currentRole} />} />
            <Route path="/config" element={<AppConfig />} />
            <Route path="/roles" element={<RolesPermissions />} />
            
            {/* Default redirect to dashboard */}
            <Route path="/" element={
              <Navigate to="/dashboard" replace />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
