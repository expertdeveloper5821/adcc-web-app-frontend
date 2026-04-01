export type DashboardVariant = 'Admin' | 'content-manager' | 'community-manager' | 'moderator';

export interface RolePermissionSet {
  id: string;
  label: string;
  dashboardVariant: DashboardVariant;
  permissions: Record<string, boolean>;
}

export const PAGE_PERMISSIONS = [
  'view_dashboard',
  'manage_events',
  'manage_communities',
  'tracks',
  'challenges',
  'badges',
  'feed',
  'marketplace',
  'cms',
  'media',
  'push',
  'users',
  'reports',
  'config',
  'languages',
  'roles',
] as const;

export type PagePermission = (typeof PAGE_PERMISSIONS)[number];

const STORAGE_KEY = 'adcc_role_permissions_v1';

const buildPermissionMap = (enabled: PagePermission[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  PAGE_PERMISSIONS.forEach((permission) => {
    map[permission] = enabled.includes(permission);
  });
  return map;
};

export const DEFAULT_ROLE_CONFIGS: RolePermissionSet[] = [
  {
    id: 'Admin',
    label: 'Super Admin',
    dashboardVariant: 'Admin',
    permissions: buildPermissionMap(PAGE_PERMISSIONS),
  },
  {
    id: 'content-manager',
    label: 'Content Manager',
    dashboardVariant: 'content-manager',
    permissions: buildPermissionMap([
      'dashboard',
      'events',
      'communities',
      'feed',
      'marketplace',
      'cms',
      'media',
      'push',
      'reports',
    ]),
  },
  {
    id: 'community-manager',
    label: 'Community Manager',
    dashboardVariant: 'community-manager',
    permissions: buildPermissionMap([
      'dashboard',
      'events',
      'communities',
      'tracks',
      'challenges',
      'badges',
      'reports',
    ]),
  },
  {
    id: 'moderator',
    label: 'Moderator',
    dashboardVariant: 'moderator',
    permissions: buildPermissionMap([
      'dashboard',
      'feed',
      'marketplace',
      'users',
      'reports',
    ]),
  },
];

const normalizeRole = (role: RolePermissionSet): RolePermissionSet => ({
  ...role,
  permissions: {
    ...buildPermissionMap([]),
    ...(role.permissions || {}),
  },
});

export const loadRoleConfigs = (): RolePermissionSet[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ROLE_CONFIGS;
    }
    const parsed = JSON.parse(raw) as RolePermissionSet[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_ROLE_CONFIGS;
    }
    return parsed.map(normalizeRole);
  } catch (_error) {
    return DEFAULT_ROLE_CONFIGS;
  }
};

export const saveRoleConfigs = (roles: RolePermissionSet[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles.map(normalizeRole)));
};

export const canAccess = (roleId: string, permission: PagePermission, roles: RolePermissionSet[]): boolean => {
  const role = roles.find((item) => item.id === roleId);
  if (!role) {
    return false;
  }
  return !!role.permissions[permission];
};

export const getRoleById = (roleId: string, roles: RolePermissionSet[]): RolePermissionSet | undefined =>
  roles.find((item) => item.id === roleId);
