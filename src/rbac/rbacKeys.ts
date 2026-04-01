import type { RbacPermission, RbacRole } from '../services/rbacService';
import type { UserRole } from '../App';

export type SidebarItemId =
  | 'dashboard'
  | 'events'
  | 'communities'
  | 'tracks'
  | 'challenges'
  | 'badges'
  | 'feed'
  | 'marketplace'
  | 'cms'
  | 'media'
  | 'push'
  | 'users'
  | 'reports'
  | 'config'
  | 'languages'
  | 'roles';

/** Default sidebar menu set by role (used as baseline visibility). */
export const ROLE_DEFAULT_SIDEBAR_ITEMS: Record<UserRole, SidebarItemId[]> = {
  Admin: [
    'dashboard', 'events', 'communities', 'tracks', 'challenges', 'badges',
    'feed', 'marketplace', 'cms', 'media', 'push', 'users', 'reports',
    'config', 'languages', 'roles',
  ],
  'community-manager': [
    'dashboard', 'events', 'communities', 'tracks', 'challenges', 'badges', 'reports',
  ],
  'content-manager': [
    'dashboard', 'events', 'communities', 'feed', 'marketplace', 'cms', 'push', 'reports',
  ],
  moderator: [
    'dashboard', 'feed', 'marketplace', 'users', 'reports',
  ],
};

/** Sidebar menu id → backend permission key (admin manages these on roles). */
export const MENU_PERMISSION_KEY: Record<string, string> = {
  dashboard: 'view_dashboard',
  events: 'manage_events',
  communities: 'manage_communities',
  tracks: 'manage_tracks',
  challenges: 'manage_challenges',
  badges: '',
  // Intentionally NOT permission-gated in sidebar
  feed: '',
  marketplace: '',
  cms: 'manage_cms',
  media: 'manage_media',
  push: '',
  users: 'manage_users',
  reports: '',
  config: 'app_configuration',
  languages: 'manage_languages',
  roles: 'manage_roles',
};

/** Critical sidebar items that must additionally pass permission checks. */
export const SIDEBAR_PERMISSION_REQUIRED: Partial<Record<SidebarItemId, string>> = {
  dashboard: 'view_dashboard',
  events: 'manage_events',
  users: 'manage_users',
  feed: 'moderate_content',
  marketplace: 'moderate_content',
  config: 'app_configuration',
};

const normalizePermissionKey = (key: string) =>
  key.toLowerCase().replace(/[\s-]+/g, '_');

/** Collect permission keys from a role (objects with .key or raw strings). */
export function permissionKeysFromRole(role: RbacRole | undefined): Set<string> {
  const set = new Set<string>();
  if (!role?.permissions?.length) return set;
  for (const p of role.permissions) {
    if (typeof p === 'string') {
      if (p.trim()) set.add(p);
      continue;
    }
    const obj = p as RbacPermission;
    if (obj.key) set.add(obj.key);
  }
  return set;
}

export interface PermissionCheckerOptions {
  rbacReady: boolean;
  /** When the user's role slug is super-admin, allow all (matches prior hardcoded behavior). */
  isSuperAdminRole: boolean;
  permissionSet: Set<string>;
}

/**
 * Returns true if the user may perform an action gated by the given permission key.
 */
export function createPermissionChecker(options: PermissionCheckerOptions) {
  const { rbacReady, isSuperAdminRole, permissionSet } = options;

  return function hasPermission(requiredKey: string): boolean {
    if (!rbacReady) return false;
    if (isSuperAdminRole) return true;

    const aliases =
      requiredKey === 'app_configuration'
        ? ['app_configuration', 'app_configure']
        : requiredKey === 'manage_cms'
          ? ['manage_cms', 'manage_store']
        : requiredKey === 'view_reports'
          ? ['view_reports', 'manage_reports']
          : [requiredKey];

    const wanted = aliases.map(normalizePermissionKey);
    for (const k of permissionSet) {
      if (wanted.includes(normalizePermissionKey(k))) return true;
    }
    return false;
  };
}
