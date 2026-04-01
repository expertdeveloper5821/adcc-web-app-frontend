import api from './api';
import {
  DEFAULT_ROLE_CONFIGS,
  DashboardVariant,
  PAGE_PERMISSIONS,
  RolePermissionSet,
} from '../rbac/permissions';

interface RoleApiRaw {
  id?: string;
  _id?: string;
  name?: string;
  label?: string;
  role?: string;
  dashboardVariant?: DashboardVariant;
  dashboard?: DashboardVariant;
  permissions?: Record<string, boolean> | string[];
  access?: Record<string, boolean> | string[];
}

const toRoleId = (raw: RoleApiRaw): string => {
  const id = raw.id || raw._id || raw.role || raw.name || raw.label;
  if (!id) return '';
  return String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const normalizePermissions = (permissions?: Record<string, boolean> | string[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  PAGE_PERMISSIONS.forEach((permission) => {
    map[permission] = false;
  });

  if (Array.isArray(permissions)) {
    permissions.forEach((permission) => {
      if (typeof permission === 'string' && permission in map) {
        map[permission] = true;
      }
    });
    return map;
  }

  if (permissions && typeof permissions === 'object') {
    PAGE_PERMISSIONS.forEach((permission) => {
      map[permission] = !!permissions[permission];
    });
  }

  return map;
};

const normalizeRole = (raw: RoleApiRaw): RolePermissionSet | null => {
  const id = toRoleId(raw);
  if (!id) return null;

  return {
    id,
    label: raw.label || raw.name || raw.role || id,
    dashboardVariant: raw.dashboardVariant || raw.dashboard || 'moderator',
    permissions: normalizePermissions(raw.permissions || raw.access),
  };
};

const extractRoles = (payload: any): RoleApiRaw[] => {
  if (Array.isArray(payload?.data?.roles)) return payload.data.roles;
  if (Array.isArray(payload?.data?.matrix?.roles)) return payload.data.matrix.roles;
  if (Array.isArray(payload?.data?.rbac?.roles)) return payload.data.rbac.roles;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.roles)) return payload.roles;
  if (Array.isArray(payload?.matrix?.roles)) return payload.matrix.roles;
  return [];
};

export const fetchRolePermissions = async (): Promise<RolePermissionSet[]> => {
  try {
    // Backend-provided RBAC matrix for current user context
    const response = await api.get('/v1/rbac/me/matrix');
    const roles = extractRoles(response.data).map(normalizeRole).filter(Boolean) as RolePermissionSet[];
    if (!roles.length) return DEFAULT_ROLE_CONFIGS;
    return roles;
  } catch (_error) {
    return DEFAULT_ROLE_CONFIGS;
  }
};

export const createRolePermission = async (payload: {
  id: string;
  label: string;
  dashboardVariant: DashboardVariant;
  permissions: Record<string, boolean>;
}) => {
  // API contract shared: /v1/rbac/roles/:roleId handles create/update via POST
  await api.post(`/v1/rbac/roles/${payload.id}`, {
    roleId: payload.id,
    label: payload.label,
    dashboardVariant: payload.dashboardVariant,
    permissions: payload.permissions,
  });
};

export const updateRolePermission = async (
  roleId: string,
  payload: { label?: string; dashboardVariant?: DashboardVariant; permissions?: Record<string, boolean> }
) => {
  await api.post(`/v1/rbac/roles/${roleId}`, payload);
};

export const deleteRolePermission = async (roleId: string) => {
  await api.delete(`/v1/rbac/roles/${roleId}`);
};
