import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllUsers, updateUserVerified, User } from '../../services/usersApi';

interface UsersListProps {
  role: UserRole;
}

const PAGE_SIZE = 10;

export function UsersList({ role }: UsersListProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = async (user: User, isVerified: boolean) => {
    setOpenMenuId(null);
    try {
      const updated = await updateUserVerified(user.id, isVerified);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: updated.isVerified } : u)));
    } catch (err: any) {
      console.error('Failed to update user status:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('users.title')}</h1>
        <p style={{ color: '#666' }}>{t('users.subtitle')}</p>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder={t('users.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : error ? (
          <div className="text-center py-8" style={{ color: '#C12D32' }}>{error}</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.name')}</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.email')}</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.status')}</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.events')}</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.joined')}</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('users.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.fullName}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.email}</td>
                    <td className="py-3 px-2">
                      <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: user.isVerified ? '#22C55E' : '#C12D32' }}>
                        {user.isVerified ? t('users.status.active') : t('users.status.inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{user.stats.totalEventsParticipated}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#666' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-2 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                      {openMenuId === user.id && (
                        <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          {user.isVerified ? (
                            <button
                              onClick={() => handleStatusChange(user, false)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                              style={{ color: '#C12D32' }}
                            >
                              {t('users.menu.setInactive')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user, true)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                              style={{ color: '#22C55E' }}
                            >
                              {t('users.menu.setActive')}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm" style={{ color: '#666' }}>
                      {t('users.noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm" style={{ color: '#666' }}>
                {t('users.page', { current: page, total: totalPages })}
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
