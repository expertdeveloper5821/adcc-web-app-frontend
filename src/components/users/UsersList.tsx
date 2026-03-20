import React, { useEffect, useState } from 'react';
import { Search, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllUsers, User } from '../../services/usersApi';

interface UsersListProps {
  role: UserRole;
}

const PAGE_SIZE = 10;

export function UsersList({ role }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { users, pagination } = await getAllUsers(page, PAGE_SIZE);
        setUsers(users);
        setTotalPages(pagination.totalPages);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: '#666' }}>Loading users...</div>
        ) : error ? (
          <div className="text-center py-8" style={{ color: '#C12D32' }}>{error}</div>
        ) : (
          <>
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.fullName}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.email}</td>
                    <td className="py-3 px-2">
                      <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: user.isVerified ? '#22C55E' : '#C12D32' }}>
                        {user.isVerified ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.stats.totalEventsParticipated}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#666' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Ban className="w-4 h-4" style={{ color: '#C12D32' }} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm" style={{ color: '#666' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm" style={{ color: '#666' }}>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: '#333' }} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: '#333' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
