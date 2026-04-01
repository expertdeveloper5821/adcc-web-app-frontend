import api from './api';

export interface RbacPermission {
  _id: string;
  id?: string;
  key?: string;
  name?: string;
  group?: string;
  sortOrder?: number;
}

export interface RbacRole {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
  permissions: Array<string | RbacPermission>;
}

type RawMyPermissionsResponse = {
  data?: {
    permissions?: Array<string | RbacPermission>;
    permissionKeys?: string[];
    role?: {
      _id?: string;
      id?: string;
      name?: string;
      slug?: string;
      permissions?: Array<string | RbacPermission>;
      permissionKeys?: string[];
    };
  };
  permissions?: Array<string | RbacPermission>;
  permissionKeys?: string[];
  role?: {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    permissions?: Array<string | RbacPermission>;
    permissionKeys?: string[];
  };
};

type RawMyRbacResponse = {
  data?: {
    role?: {
      _id?: string;
      id?: string;
      name?: string;
      slug?: string;
      permissions?: Array<string | RbacPermission>;
      permissionKeys?: string[];
    };
    permissions?: Array<string | RbacPermission>;
    permissionKeys?: string[];
  };
  role?: {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    permissions?: Array<string | RbacPermission>;
    permissionKeys?: string[];
  };
  permissions?: Array<string | RbacPermission>;
  permissionKeys?: string[];
};

type RawRoleResponse = {
  roles?: RbacRole[];
  data?: RbacRole[] | { roles?: RbacRole[] };
} | RbacRole[];

const normalizeRolesResponse = (payload: RawRoleResponse): RbacRole[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.roles)) return payload.roles;
  if (Array.isArray((payload as any).data)) return (payload as any).data;
  if (Array.isArray((payload as any).data?.roles)) return (payload as any).data.roles;
  return [];
};

export const getRbacRoles = async (): Promise<RbacRole[]> => {
  const res = await api.get<any>('/v1/rbac/roles');
  return normalizeRolesResponse(res.data as RawRoleResponse);
};

export const getRoleById = async (roleId: string): Promise<RbacRole> => {
  const res = await api.get<any>(`/v1/rbac/roles/${roleId}`);
  const payload = res.data as { data?: RbacRole } | RbacRole;
  const data = (payload as any)?.data ?? payload;
  return data as RbacRole;
};

export const getMyRbac = async (): Promise<{
  role?: Partial<RbacRole>;
  permissions: Array<string | RbacPermission>;
}> => {
  const res = await api.get<RawMyRbacResponse>('/v1/rbac/me');
  const payload = res.data as RawMyRbacResponse;
  const data = payload?.data ?? payload;
  const role = data?.role ?? payload?.role;
  const permissionKeys =
    data?.permissionKeys ??
    role?.permissionKeys ??
    payload?.permissionKeys;
  const permissions =
    permissionKeys ??
    data?.permissions ??
    role?.permissions ??
    payload?.permissions ??
    [];

  return {
    role: role as Partial<RbacRole> | undefined,
    permissions: Array.isArray(permissions) ? permissions : [],
  };
};

export const getMyPermissions = async (): Promise<{
  role?: Partial<RbacRole>;
  permissions: Array<string | RbacPermission>;
}> => {
  const res = await api.get<RawMyPermissionsResponse>('/v1/en/rbac/me/permissions');
  const payload = res.data as RawMyPermissionsResponse;
  const data = payload?.data ?? payload;
  const role = data?.role ?? payload?.role;
  const permissionKeys =
    data?.permissionKeys ??
    role?.permissionKeys ??
    payload?.permissionKeys;
  const permissions =
    permissionKeys ??
    data?.permissions ??
    role?.permissions ??
    payload?.permissions ??
    [];

  return {
    role: role as Partial<RbacRole> | undefined,
    permissions: Array.isArray(permissions) ? permissions : [],
  };
};

export const updateRolePermissions = async (
  roleId: string,
  permissions: string[],
): Promise<RbacRole> => {
  const res = await api.patch<any>(`/v1/rbac/roles/${roleId}`, { permissions });
  const data = (res.data as any)?.data ?? res.data;
  return data as RbacRole;
};

export const addPermissionToRole = async (
  roleId: string,
  permissionId: string,
): Promise<RbacRole> => {
  const res = await api.post<any>(
    `/v1/rbac/roles/${roleId}/permissions/${permissionId}`,
    { permissionId },
  );
  const data = (res.data as any)?.data ?? res.data;
  return data as RbacRole;
};

export const removePermissionFromRole = async (
  roleId: string,
  permissionId: string,
): Promise<RbacRole> => {
  const res = await api.delete<any>(
    `/v1/rbac/roles/${roleId}/permissions/${permissionId}`,
    { data: { permissionId } },
  );
  const data = (res.data as any)?.data ?? res.data;
  return data as RbacRole;
};

