import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
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
import { EventParticipants } from './events/EventParticipants';
import { EventEdit } from './events/EventEdit';
import { CommunitiesList } from './communities/CommunitiesList';
import { CommunityCreate } from './communities/CommunityCreate';
import { CommunityDetail } from './communities/CommunityDetail';
import { CommunityEdit } from './communities/CommunityEdit';
import { TracksList } from './tracks/TracksList';
import { TrackCreate } from './tracks/TrackCreate';
import { TrackDetail } from './tracks/TrackDetail';
import { TrackEdit } from './tracks/TrackEdit';
import { ChallengesList } from './challenges/ChallengesList';
import { ChallengeDetail } from './challenges/ChallengeDetail';
import { ChallengeCreate } from './challenges/ChallengeCreate';
import { FeedModeration } from './feed/FeedModeration';
import { MarketplaceModeration } from './marketplace/MarketplaceModeration';
import { CMS } from './cms/CMS';
import { MediaLibrary } from './media/MediaLibrary';
import { PushNotifications } from './push/PushNotifications';
import { UsersList } from './users/UsersList';
import { Reports } from './reports/Reports';
import { AppConfig } from './config/AppConfig';
import { RolesPermissions } from './roles/RolesPermissions';
import { BadgesList } from './badges/BadgesList';
import { BadgesCreate } from './badges/BadgesCreate';
import { LanguagesList } from './languages/LanguagesList';
import { useEffect, useMemo } from 'react';
import { getRbacRoles, type RbacRole, type RbacPermission } from '../services/rbacService';
import { toast } from 'sonner';

export function Layout() {
  const [currentRole, setCurrentRole] = useState<UserRole>('super-admin');
  const [rolesBySlug, setRolesBySlug] = useState<Record<string, RbacRole>>({});
  const location = useLocation();
  // Extract current page from pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/events')) return 'events';
    if (path.startsWith('/communities')) return 'communities';
    if (path.startsWith('/tracks')) return 'tracks';
    if (path.startsWith('/challenges')) return 'challenges';
    if (path.startsWith('/feed')) return 'feed';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/cms')) return 'cms';
    if (path.startsWith('/media')) return 'media';
    if (path.startsWith('/push')) return 'push';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/config')) return 'config';
    if (path.startsWith('/roles')) return 'roles';
    if (path.startsWith('/badges')) return 'badges';
    if (path.startsWith('/languages')) return 'languages';
    if (path.startsWith('/badges/create')) return 'badges-create';
    if (path.startsWith('/badges/:id/edit')) return 'badges-edit';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getRbacRoles();
        const map: Record<string, RbacRole> = {};
        roles.forEach((r) => {
          if (r.slug) map[r.slug] = r;
        });
        setRolesBySlug(map);
      } catch (error: any) {
        console.error('Error loading RBAC roles in layout', error);
        toast.error(error?.response?.data?.message || 'Failed to load role permissions');
      }
    };
    loadRoles();
  }, []);

  const permissionSet = useMemo(() => {
    const role = rolesBySlug[currentRole];
    const items = role?.permissions ?? [];
    const set = new Set<string>();
    items.forEach((p) => {
      if (typeof p === 'string') return;
      if (p.key) set.add(p.key);
    });
    return set;
  }, [rolesBySlug, currentRole]);

  const normalizePermissionKey = (key: string) =>
    key.toLowerCase().replace(/[\s-]+/g, '_');

  const hasPermission = (key: string) => {
    const aliases = key === 'app_configuration'
      ? ['app_configuration', 'app_configure']
      : [key];
    const wanted = aliases.map(normalizePermissionKey);
    for (const k of permissionSet) {
      if (wanted.includes(normalizePermissionKey(k))) return true;
    }
    return false;
  };

  const Unauthorized = () => (
    <div className="rounded-2xl p-8 bg-white shadow-sm">
      <h2 className="text-2xl mb-2" style={{ color: '#333' }}>Unauthorized</h2>
      <p style={{ color: '#666' }}>You are not allowed to access this page.</p>
    </div>
  );

  const withPermission = (permissionKey: string, element: React.ReactElement) =>
    hasPermission(permissionKey) ? element : <Unauthorized />;

  function BadgesEditWrapper({ role }: { role: UserRole }) {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;
    return <BadgesCreate navigate={() => {}} badgeId={id} />;
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <TopBar currentRole={currentRole} setRole={setCurrentRole} />
      <div className="flex">
        <Sidebar currentRole={currentRole} currentPage={currentPage} permissionSet={permissionSet} />
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
            <Route path="/events" element={withPermission('manage_events', <EventsList navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/create" element={withPermission('manage_events', <EventCreate navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id/edit" element={withPermission('manage_events', <EventEdit navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id" element={withPermission('manage_events', <EventDetail navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id/event-participants" element={withPermission('manage_events', <EventParticipants role={currentRole} />)} />
            
            {/* Communities Routes */}
            <Route path="/communities" element={<CommunitiesList role={currentRole} />} />
            <Route path="/communities/create" element={<CommunityCreate />} />
            <Route path="/communities/:id/edit" element={<CommunityEdit navigate={() => {}} role={currentRole} />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
            

            {/* Challenges Routes */}
            <Route path="/challenges" element={<ChallengesList role={currentRole} />} />
            <Route path="/challenges/create" element={<ChallengeCreate />} />
            <Route path="/challenges/:id" element={<ChallengeDetail role={currentRole} />} />
            <Route path="/challenges/:id/edit" element={<ChallengeCreate />} />

            <Route path="/tracks" element={<TracksList navigate={() => {}} role={currentRole} />} />
            <Route path="/tracks/create" element={<TrackCreate navigate={() => {}} role={currentRole} />} />
            <Route path="/tracks/:id" element={<TrackDetail navigate={() => {}} role={currentRole} />} />
            <Route path='/tracks/:id/edit' element={<TrackEdit navigate={() => {}} role={currentRole} />} />
            
            {/* Badges Routes */}
            <Route path="/badges" element={<BadgesList navigate={() => {}} role={currentRole} />} />
            <Route path="/badges/create" element={<BadgesCreate navigate={() => {}} />} />
            <Route path="/badges/:id/edit" element={<BadgesEditWrapper role={currentRole} />} />
            {/* Other Routes */}
            <Route path="/feed" element={withPermission('moderate_content', <FeedModeration />)} />
            <Route path="/marketplace" element={withPermission('moderate_content', <MarketplaceModeration />)} />
            <Route path="/cms" element={<CMS />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/push" element={<PushNotifications />} />
            <Route path="/users" element={withPermission('manage_users', <UsersList role={currentRole} />)} />
            <Route path="/reports" element={<Reports role={currentRole} />} />
            <Route path="/config" element={withPermission('app_configuration', <AppConfig />)} />
            <Route path="/roles" element={<RolesPermissions />} />
            <Route path="/languages" element={<LanguagesList />} />
            
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
