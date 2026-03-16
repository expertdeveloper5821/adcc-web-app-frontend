import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Trophy, Users, CheckCircle, Calendar, Copy, Trash2, Edit, Eye } from 'lucide-react';
import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  deleteChallengeById,
  Challenge,
} from '../../services/challengesApi';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { useTranslation } from 'react-i18next';

interface ChallengesListProps {
  role: UserRole;
}

export function ChallengesList({ role }: ChallengesListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const canCreate = role === 'super-admin' || role === 'community-manager';
  const canEdit = role === 'super-admin' || role === 'community-manager';
  const canDelete = role === 'super-admin';

  const fetchChallenges = useCallback(async () => {
    try {
      setError(null);
      const list = await getAllChallenges({ limit: 500 });
      setChallenges(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('challenges.failedToLoad'));
      toast.error(t('challenges.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || challenge.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteChallengeById(id);
      setChallenges((prev) => prev.filter((c) => c.id !== id));
      toast.success(t('challenges.deletedSuccess'));
      setDeleteConfirm(null);
      setActiveDropdown(null);
    } catch {
      toast.error(t('challenges.failedToDelete'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(id);
    try {
      const existing = await getChallengeById(id);
      const created = await createChallenge({
        ...existing,
        title: `${existing.title} (Copy)`,
        status: 'Draft',
        participants: 0,
        completions: 0,
      });
      setChallenges((prev) => [created, ...prev]);
      toast.success(t('challenges.duplicatedSuccess'));
      setActiveDropdown(null);
      navigate(`/challenges/${created.id}`);
    } catch {
      toast.error(t('challenges.failedToDuplicate'));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Upcoming': return '#F59E0B';
      case 'Completed': return '#6B7280';
      case 'Draft': return '#9CA3AF';
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'Distance': return '#3B82F6';
      case 'Frequency': return '#8B5CF6';
      case 'Duration': return '#EC4899';
      case 'Social': return '#F59E0B';
      case 'Event': return '#10B981';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('challenges.title')}</h1>
          <p style={{ color: '#666' }}>{t('challenges.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('challenges.title')}</h1>
          <p style={{ color: '#666' }}>{error}</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchChallenges(); }}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#C12D32' }}
        >
          {t('challenges.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('challenges.title')}</h1>
          <p style={{ color: '#666' }}>
            {t('challenges.subtitle')}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/challenges/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            {t('challenges.createChallenge')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.activeChallenges')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {challenges.filter(c => c.status === 'Active').length}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.totalParticipants')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.completions')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {challenges.reduce((sum, c) => sum + c.completions, 0).toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.upcoming')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {challenges.filter(c => c.status === 'Upcoming').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder={t('challenges.searchChallenges')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">{t('challenges.allTypes')}</option>
            <option value="Distance">{t('challenges.typeLabels.Distance')}</option>
            <option value="Frequency">{t('challenges.typeLabels.Frequency')}</option>
            <option value="Duration">{t('challenges.typeLabels.Duration')}</option>
            <option value="Social">{t('challenges.typeLabels.Social')}</option>
            <option value="Event">{t('challenges.typeLabels.Event')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">{t('challenges.allStatus')}</option>
            <option value="Active">{t('challenges.statusLabels.Active')}</option>
            <option value="Upcoming">{t('challenges.statusLabels.Upcoming')}</option>
            <option value="Completed">{t('challenges.statusLabels.Completed')}</option>
            <option value="Draft">{t('challenges.statusLabels.Draft')}</option>
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all cursor-pointer relative group"
            onClick={() => navigate(`/challenges/${challenge.id}`)}
          >
            {/* Featured Badge */}
            {challenge.featured && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#C12D32' }}>
                {t('challenges.featured')}
              </div>
            )}

            {/* Actions Dropdown */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === challenge.id ? null : challenge.id);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" style={{ color: '#666' }} />
              </button>

              {activeDropdown === challenge.id && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      navigate(`/challenges/${challenge.id}`);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {t('challenges.viewDetails')}
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => {
                        navigate(`/challenges/${challenge.id}/edit`);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {t('common.edit')}
                    </button>
                  )}
                  {canCreate && (
                    <button
                      onClick={() => handleDuplicate(challenge.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {t('challenges.duplicate')}
                    </button>
                  )}
                  {canDelete && (
                    <>
                      <hr className="my-2" />
                      <button
                        onClick={() => setDeleteConfirm(challenge.id)}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('common.delete')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Challenge Image */}
            <img
              src={challenge.image}
              alt={challenge.title}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            {/* Challenge Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getTypeColor(challenge.type) }}
                >
                  {t(`challenges.typeLabels.${challenge.type}`)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getStatusColor(challenge.status) }}
                >
                  {t(`challenges.statusLabels.${challenge.status}`)}
                </span>
              </div>

              <h3 className="text-lg font-medium" style={{ color: '#333' }}>
                {challenge.title}
              </h3>

              <p className="text-sm line-clamp-2" style={{ color: '#666' }}>
                {challenge.description}
              </p>

              {/* Target */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-sm" style={{ color: '#666' }}>
                  {t('challenges.target')}: <span className="font-medium" style={{ color: '#C12D32' }}>
                    {challenge.target} {challenge.unit}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999' }}>{t('challenges.participants')}</p>
                  <p className="text-lg" style={{ color: '#333' }}>{challenge.participants}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#999' }}>{t('challenges.completions')}</p>
                  <p className="text-lg" style={{ color: '#333' }}>{challenge.completions}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs" style={{ color: '#999' }}>
                {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('challenges.deleteChallenge')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('challenges.deleteConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50"
                style={{ backgroundColor: '#C12D32' }}
              >
                {actionLoading === deleteConfirm ? t('challenges.deleting') : t('common.delete')}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('challenges.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
          <h3 className="text-xl mb-2" style={{ color: '#333' }}>{t('challenges.noChallenges')}</h3>
          <p style={{ color: '#666' }}>
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? t('challenges.adjustFilters')
              : t('challenges.createFirst')}
          </p>
        </div>
      )}
    </div>
  );
}
