import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  addPermissionToRole,
  getRbacRoles,
  removePermissionFromRole,
  type RbacPermission,
  type RbacRole,
} from '../../services/rbacService';

type RoleColumnKey = 'super' | 'content' | 'community' | 'moderator';

type PermissionRow = {
  id: string;
  name: string;
  key: string;
  group: string;
  sortOrder: number;
};

type RoleSlugMap = Record<RoleColumnKey, string>;

const ROLE_SLUGS: RoleSlugMap = {
  super: 'Admin',
  content: 'content-manager',
  community: 'community-manager',
  moderator: 'moderator',
};

type RolesBySlug = Record<string, RbacRole | undefined>;

export function RolesPermissions() {
  const [rolesBySlug, setRolesBySlug] = useState<RolesBySlug>({});
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [saving, setSaving] = useState(false);

  const getPermissionId = (perm: string | RbacPermission): string => {
    if (typeof perm === 'string') return perm;
    return (perm._id || perm.id || '').toString();
  };

  const extractPermissionMeta = (perm: string | RbacPermission): PermissionRow | null => {
    if (typeof perm === 'string') {
      return {
        id: perm,
        name: perm,
        key: perm,
        group: 'Other',
        sortOrder: 9999,
      };
    }
    const id = (perm._id || perm.id || '').toString();
    if (!id) return null;
    return {
      id,
      key: (perm.key || id).toString(),
      name: (perm.name || perm.key || id).toString(),
      group: (perm.group || 'Other').toString(),
      sortOrder: Number(perm.sortOrder ?? 9999),
    };
  };

  const loadRoles = async () => {
    try {
      const roles = await getRbacRoles();
      const map: RolesBySlug = {};
      const permissionMap = new Map<string, PermissionRow>();

      roles.forEach((role) => {
        const slug = (role.slug || role.name || '').toString();
        if (slug) map[slug] = role;

        (role.permissions || []).forEach((perm) => {
          const meta = extractPermissionMeta(perm);
          if (!meta) return;
          const existing = permissionMap.get(meta.id);
          // Prefer richer metadata if available
          if (!existing || (existing.name === existing.id && meta.name !== meta.id)) {
            permissionMap.set(meta.id, meta);
          }
        });
      });

      const rows = Array.from(permissionMap.values()).sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });

      setRolesBySlug(map);
      setPermissionRows(rows);
    } catch (error: any) {
      console.error('Error loading roles', error);
      toast.error(error?.response?.data?.message || 'Failed to load roles');
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const togglePermission = async (column: RoleColumnKey, perm: PermissionRow) => {
    const slug = ROLE_SLUGS[column];
    const role = rolesBySlug[slug];
    if (!role?._id && !role?.id) {
      toast.error('Role not found for this column');
      return;
    }

    const roleId = role._id || role.id!;
    const current = Array.isArray(role.permissions) ? role.permissions.map(getPermissionId).filter(Boolean) : [];
    const hasPermission = current.includes(perm.id);

    try {
      setSaving(true);
      if (hasPermission) {
        await removePermissionFromRole(roleId, perm.id);
      } else {
        await addPermissionToRole(roleId, perm.id);
      }
      await loadRoles();
      toast.success(hasPermission ? 'Permission removed' : 'Permission added');
    } catch (error: any) {
      console.error('Error updating role permissions', error);
      toast.error(error?.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Roles & Permissions</h1>
        <p style={{ color: '#666' }}>Manage user roles and access control</p>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Permission</th>
              <th className="text-center py-3 px-2 text-sm" style={{ color: '#666' }}>Super Admin</th>
              <th className="text-center py-3 px-2 text-sm" style={{ color: '#666' }}>Content Manager</th>
              <th className="text-center py-3 px-2 text-sm" style={{ color: '#666' }}>Community Manager</th>
              <th className="text-center py-3 px-2 text-sm" style={{ color: '#666' }}>Moderator</th>
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((perm, index) => {
              const prev = permissionRows[index - 1];
              const showGroup = !prev || prev.group !== perm.group;
              const roleHas = (roleSlug: string) => {
                const role = rolesBySlug[roleSlug];
                const ids = (role?.permissions || []).map(getPermissionId);
                return ids.includes(perm.id);
              };

              return (
                <React.Fragment key={perm.id}>
                  {/* {showGroup && (
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td colSpan={5} className="py-2 px-2 text-xs font-medium uppercase tracking-wide" style={{ color: '#666' }}>
                        {perm.group}
                      </td>
                    </tr>
                  )} */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{perm.name}</td>
                    <td className="py-3 px-2 text-center">
                      {(() => {
                        const has = roleHas(ROLE_SLUGS.super);
                        const Icon = has ? CheckCircle : XCircle;
                        const color = has ? '#CF9F0C' : '#999';
                        return (
                          <button
                            type="button"
                            onClick={() => togglePermission('super', perm)}
                            disabled={saving}
                            className="inline-flex items-center justify-center"
                            aria-label={has ? 'Revoke permission from Super Admin' : 'Grant permission to Super Admin'}
                          >
                            <Icon className="w-5 h-5 mx-auto" style={{ color }} />
                          </button>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {(() => {
                        const has = roleHas(ROLE_SLUGS.content);
                        const Icon = has ? CheckCircle : XCircle;
                        const color = has ? '#CF9F0C' : '#999';
                        return (
                          <button
                            type="button"
                            onClick={() => togglePermission('content', perm)}
                            disabled={saving}
                            className="inline-flex items-center justify-center"
                            aria-label={has ? 'Revoke permission from Content Manager' : 'Grant permission to Content Manager'}
                          >
                            <Icon className="w-5 h-5 mx-auto" style={{ color }} />
                          </button>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {(() => {
                        const has = roleHas(ROLE_SLUGS.community);
                        const Icon = has ? CheckCircle : XCircle;
                        const color = has ? '#CF9F0C' : '#999';
                        return (
                          <button
                            type="button"
                            onClick={() => togglePermission('community', perm)}
                            disabled={saving}
                            className="inline-flex items-center justify-center"
                            aria-label={has ? 'Revoke permission from Community Manager' : 'Grant permission to Community Manager'}
                          >
                            <Icon className="w-5 h-5 mx-auto" style={{ color }} />
                          </button>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {(() => {
                        const has = roleHas(ROLE_SLUGS.moderator);
                        const Icon = has ? CheckCircle : XCircle;
                        const color = has ? '#CF9F0C' : '#999';
                        return (
                          <button
                            type="button"
                            onClick={() => togglePermission('moderator', perm)}
                            disabled={saving}
                            className="inline-flex items-center justify-center"
                            aria-label={has ? 'Revoke permission from Moderator' : 'Grant permission to Moderator'}
                          >
                            <Icon className="w-5 h-5 mx-auto" style={{ color }} />
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
