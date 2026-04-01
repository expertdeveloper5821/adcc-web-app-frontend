import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import { getMyPermissions, getMyRbac, getRoleById, type RbacRole } from '../services/rbacService';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import {
  createPermissionChecker,
  permissionKeysFromRole,
  ROLE_DEFAULT_SIDEBAR_ITEMS,
  SIDEBAR_PERMISSION_REQUIRED,
  type SidebarItemId,
} from '../rbac/rbacKeys';

function normalizeRoleSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function slugToUserRole(slug: string | undefined): UserRole | null {
  if (!slug) return null;
  const s = normalizeRoleSlug(slug);
  const aliases: Record<string, UserRole> = {
    'super-admin': 'Admin',
    superadmin: 'Admin',
    admin: 'Admin',
    'content-manager': 'content-manager',
    'contentent-manager': 'content-manager',
    contentmanager: 'content-manager',
    content: 'content-manager',
    'community-manager': 'community-manager',
    communitymanager: 'community-manager',
    community: 'community-manager',
    moderator: 'moderator',
    moderate: 'moderator',
  };
  if (aliases[s]) return aliases[s];
  const keys: UserRole[] = ['Admin', 'content-manager', 'community-manager', 'moderator'];
  if (keys.includes(s as UserRole)) return s as UserRole;
  return null;
}

export function Layout() {
  const { userProfile } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>('moderator');
  const [myRole, setMyRole] = useState<Partial<RbacRole> | undefined>(undefined);
  const [permissionSet, setPermissionSet] = useState<Set<string>>(new Set<string>());
  const [rbacLoaded, setRbacLoaded] = useState(false);

  useEffect(() => {
    const loadMyAccess = async () => {
      try {
        const myRbac = await getMyRbac();
        if (myRbac.role || (myRbac.permissions && myRbac.permissions.length > 0)) {
          setMyRole(myRbac.role);
          const fakeRole = { permissions: myRbac.permissions } as RbacRole;
          setPermissionSet(permissionKeysFromRole(fakeRole));
          return;
        }

        const roleId = userProfile?.roleId;
        if (roleId) {
          const role = await getRoleById(roleId);
          setMyRole(role);
          setPermissionSet(permissionKeysFromRole(role));
          return;
        }

        const result = await getMyPermissions();
        setMyRole(result.role);
        const fakeRole = { permissions: result.permissions } as RbacRole;
        setPermissionSet(permissionKeysFromRole(fakeRole));
      } catch (error: any) {
        console.error('Error loading RBAC permissions in layout', error);
        toast.error(error?.response?.data?.message || 'Failed to load your permissions');
        setMyRole(undefined);
        setPermissionSet(new Set<string>());
      } finally {
        setRbacLoaded(true);
      }
    };
    void loadMyAccess();
  }, [userProfile?.roleId]);

  useEffect(() => {
    const mapped =
      slugToUserRole(myRole?.slug) ||
      slugToUserRole(myRole?.name) ||
      slugToUserRole(userProfile?.role);
    if (mapped) setCurrentRole(mapped);
  }, [myRole?.slug, myRole?.name, userProfile?.role]);

  const isSuperAdminRole =
    normalizeRoleSlug(myRole?.slug || '') === 'super-admin' ||
    normalizeRoleSlug(userProfile?.role || '') === 'super-admin' ||
    normalizeRoleSlug(userProfile?.role || '') === 'admin';
  const rbacReady = rbacLoaded && !!userProfile;

  const hasPermission = useMemo(
    () =>
      createPermissionChecker({
        rbacReady,
        isSuperAdminRole,
        permissionSet,
      }),
    [rbacReady, isSuperAdminRole, permissionSet],
  );

  const Unauthorized = () => (
    <div className="rounded-2xl p-8 bg-white shadow-sm">
      <h2 className="text-2xl mb-2" style={{ color: '#333' }}>Unauthorized</h2>
      <p style={{ color: '#666' }}>You are not allowed to access this page.</p>
    </div>
  );

  const withPermission = (permissionKey: string, element: React.ReactElement) =>
    hasPermission(permissionKey) ? element : <Unauthorized />;
  const withRoleSidebarAccess = (sidebarItem: SidebarItemId, element: React.ReactElement) => {
    const allowedItems = ROLE_DEFAULT_SIDEBAR_ITEMS[currentRole] || [];
    if (!allowedItems.includes(sidebarItem)) return <Unauthorized />;
    const strictPerm = SIDEBAR_PERMISSION_REQUIRED[sidebarItem];
    if (strictPerm && !hasPermission(strictPerm)) return <Unauthorized />;
    return element;
  };

  const roleTitle = useMemo(() => {
    if (myRole?.name) return myRole.name;
    if (userProfile?.role) return userProfile.role;
    return currentRole;
  }, [myRole?.name, userProfile?.role, currentRole]);

  function BadgesEditWrapper() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;
    return <BadgesCreate navigate={() => {}} badgeId={id} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <TopBar roleTitle={roleTitle} />
      <div className="flex">
        <Sidebar currentRole={currentRole} hasPermission={hasPermission} />
        <main className="flex-1 p-8 ml-64 mt-16">
          <Routes>
            <Route
              path="/dashboard"
              element={withPermission(
                'view_dashboard',
                currentRole === 'Admin' ? (
                  <SuperAdminDashboard />
                ) : currentRole === 'content-manager' ? (
                  <ContentManagerDashboard />
                ) : currentRole === 'community-manager' ? (
                  <CommunityManagerDashboard />
                ) : (
                  <ModeratorDashboard />
                ),
              )}
            />

            <Route path="/events" element={withPermission('manage_events', <EventsList navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/create" element={withPermission('manage_events', <EventCreate navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id/edit" element={withPermission('manage_events', <EventEdit navigate={() => {}} role={currentRole} />)} />
            <Route path="/events/:id" element={withPermission('manage_events', <EventDetail />)} />
            <Route path="/events/:id/event-participants" element={withPermission('manage_events', <EventParticipants role={currentRole} />)} />

            <Route path="/communities" element={withRoleSidebarAccess('communities', <CommunitiesList role={currentRole} />)} />
            <Route path="/communities/create" element={withRoleSidebarAccess('communities', <CommunityCreate />)} />
            <Route path="/communities/:id/edit" element={withRoleSidebarAccess('communities', <CommunityEdit navigate={() => {}} role={currentRole} />)} />
            <Route path="/communities/:id" element={withRoleSidebarAccess('communities', <CommunityDetail />)} />

            <Route path="/challenges" element={withRoleSidebarAccess('challenges', <ChallengesList role={currentRole} />)} />
            <Route path="/challenges/create" element={withRoleSidebarAccess('challenges', <ChallengeCreate />)} />
            <Route path="/challenges/:id" element={withRoleSidebarAccess('challenges', <ChallengeDetail role={currentRole} />)} />
            <Route path="/challenges/:id/edit" element={withRoleSidebarAccess('challenges', <ChallengeCreate />)} />

            <Route path="/tracks" element={withRoleSidebarAccess('tracks', <TracksList navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/create" element={withRoleSidebarAccess('tracks', <TrackCreate navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/:id" element={withRoleSidebarAccess('tracks', <TrackDetail navigate={() => {}} role={currentRole} />)} />
            <Route path="/tracks/:id/edit" element={withRoleSidebarAccess('tracks', <TrackEdit navigate={() => {}} role={currentRole} />)} />
            
            <Route path="/badges" element={withRoleSidebarAccess('badges', <BadgesList navigate={() => {}} role={currentRole} />)} />
            <Route path="/badges/create" element={withRoleSidebarAccess('badges', <BadgesCreate navigate={() => {}} />)} />
            <Route path="/badges/:id/edit" element={withRoleSidebarAccess('badges', <BadgesEditWrapper />)} />
            <Route path="/feed" element={withRoleSidebarAccess('feed', <FeedModeration />)} />
            <Route path="/marketplace" element={withRoleSidebarAccess('marketplace', <MarketplaceModeration navigate={() => {}} role={currentRole} />)} />
            <Route path="/cms" element={withPermission('manage_cms', <CMS />)} />
            <Route path="/media" element={withPermission('manage_media', <MediaLibrary />)} />
            <Route path="/push" element={withRoleSidebarAccess('push', <PushNotifications />)} />
            <Route path="/users" element={withPermission('manage_users', <UsersList role={currentRole} />)} />
            <Route path="/reports" element={withRoleSidebarAccess('reports', <Reports role={currentRole} />)} />
            <Route path="/config" element={withPermission('app_configuration', <AppConfig />)} />
            <Route path="/roles" element={withPermission('manage_roles', <RolesPermissions />)} />
            <Route path="/languages" element={withPermission('manage_languages', <LanguagesList />)} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
