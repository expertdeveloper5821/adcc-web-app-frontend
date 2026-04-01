import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

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
            {permissions.map((perm, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{perm.name}</td>
                <td className="py-3 px-2 text-center">
                  {perm.super ? <CheckCircle className="w-5 h-5 mx-auto" style={{ color: '#CF9F0C' }} /> : <XCircle className="w-5 h-5 mx-auto" style={{ color: '#999' }} />}
                </td>
                <td className="py-3 px-2 text-center">
                  {perm.content ? <CheckCircle className="w-5 h-5 mx-auto" style={{ color: '#CF9F0C' }} /> : <XCircle className="w-5 h-5 mx-auto" style={{ color: '#999' }} />}
                </td>
                <td className="py-3 px-2 text-center">
                  {perm.community ? <CheckCircle className="w-5 h-5 mx-auto" style={{ color: '#CF9F0C' }} /> : <XCircle className="w-5 h-5 mx-auto" style={{ color: '#999' }} />}
                </td>
                <td className="py-3 px-2 text-center">
                  {perm.moderator ? <CheckCircle className="w-5 h-5 mx-auto" style={{ color: '#CF9F0C' }} /> : <XCircle className="w-5 h-5 mx-auto" style={{ color: '#999' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
