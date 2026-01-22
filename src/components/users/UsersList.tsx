import React from 'react';
import { Search, Ban, UserCheck } from 'lucide-react';
import { UserRole } from '../../App';

interface UsersListProps {
  role: UserRole;
}

const users = [
  { id: '1', name: 'Ahmed Al Mansoori', email: 'ahmed@example.com', status: 'Active', events: 12, joined: '2025-06-15' },
  { id: '2', name: 'Sara Ali', email: 'sara@example.com', status: 'Active', events: 8, joined: '2025-07-22' },
  { id: '3', name: 'Mohammed Hassan', email: 'mohammed@example.com', status: 'Active', events: 15, joined: '2025-05-10' },
];

export function UsersList({ role }: UsersListProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Users</h1>
        <p style={{ color: '#666' }}>Manage user accounts and permissions</p>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Name</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Email</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Status</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Events</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Joined</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.name}</td>
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.email}</td>
                <td className="py-3 px-2">
                  <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#CF9F0C' }}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.events}</td>
                <td className="py-3 px-2 text-sm" style={{ color: '#666' }}>
                  {new Date(user.joined).toLocaleDateString()}
                </td>
                <td className="py-3 px-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Ban className="w-4 h-4" style={{ color: '#C12D32' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
