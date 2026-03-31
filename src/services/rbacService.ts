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

