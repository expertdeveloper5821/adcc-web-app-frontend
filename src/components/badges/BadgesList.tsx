import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreVertical, Award, Users, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '../ui/skeleton';
import { getBadgeEmoji } from '../../data/badgesIcons';
import { Badge, getAllBadges, deleteBadgeApi } from '../../services/badgesService';

interface BadgesListProps {
  navigate: (page: string, params?: any) => void;
  role: string;
}

export function BadgesList({ navigate, role }: BadgesListProps) {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const routerNavigate = useNavigate();

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const list = await getAllBadges();
      console.log(list,'list');
      setBadges(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Error fetching badges:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('badges.toasts.loadError', 'Failed to load badges. Please try again.');
      setError(message);
      toast.error(message);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || badge.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || badge.rarity === rarityFilter;
    return matchesSearch && matchesCategory && matchesRarity && badge.active;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteBadgeApi(id);
      toast.success(t('badges.toasts.deleteSuccess', 'Badge deleted successfully'));
      setDeleteConfirm(null);
      setActiveDropdown(null);
      fetchBadges();
    } catch (err: any) {
      console.error('Error deleting badge:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t('badges.toasts.deleteError', 'Failed to delete badge.');
      toast.error(message);
    }
  };

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'Common': return '#6B7280';
      case 'Rare': return '#3B82F6';
      case 'Epic': return '#8B5CF6';
      case 'Legendary': return '#F59E0B';
    }
  };

  const getCategoryColor = (category: Badge['category']) => {
    switch (category) {
      case 'Distance': return '#3B82F6';
      case 'Event': return '#10B981';
      case 'Social': return '#F59E0B';
      case 'Achievement': return '#8B5CF6';
      case 'Special': return '#EC4899';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {t('sidebar.badges', 'Badges & Rewards')}
          </h1>
          <p style={{ color: '#666' }}>
            {t(
              'badges.subtitle',
              'Manage achievement badges and rewards for your community',
            )}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => routerNavigate('/badges/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            {t('badges.createButton', 'Create Badge')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('badges.totalBadges', 'Total Badges')}
            </span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{badges.filter(b => b.active).length}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('badges.timesAwarded', 'Times Awarded')}
            </span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {badges.reduce((sum, b) => sum + b.timesAwarded, 0).toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5" style={{ color: '#F59E0B' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('badges.legendary', 'Legendary')}
            </span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {badges.filter(b => b.rarity === 'Legendary').length}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            <span className="text-sm" style={{ color: '#666' }}>
              {t('badges.epic', 'Epic')}
            </span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {badges.filter(b => b.rarity === 'Epic').length}
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
              placeholder={t('badges.filters.search', 'Search badges...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">{t('badges.filters.allCategories', 'All Categories')}</option>
            <option value="Distance">{t('badges.categories.Distance', 'Distance')}</option>
            <option value="Event">{t('badges.categories.Event', 'Event')}</option>
            <option value="Social">{t('badges.categories.Social', 'Social')}</option>
            <option value="Achievement">{t('badges.categories.Achievement', 'Achievement')}</option>
            <option value="Special">{t('badges.categories.Special', 'Special')}</option>
          </select>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">{t('badges.filters.allRarities', 'All Rarities')}</option>
            <option value="Common">{t('badges.rarities.Common', 'Common')}</option>
            <option value="Rare">{t('badges.rarities.Rare', 'Rare')}</option>
            <option value="Epic">{t('badges.rarities.Epic', 'Epic')}</option>
            <option value="Legendary">{t('badges.rarities.Legendary', 'Legendary')}</option>
          </select>
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all cursor-pointer relative group"
            >
            {/* Actions Dropdown */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === badge.id ? null : badge.id);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" style={{ color: '#666' }} />
              </button>
              
              {activeDropdown === badge.id && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canEdit && (
                    <button
                      onClick={() => {
                        routerNavigate(`/badges/${badge.id}/edit`);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {t('common.edit')}
                    </button>
                  )}
                  {canDelete && (
                    <>
                      <hr className="my-2" />
                      <button
                        onClick={() => setDeleteConfirm(badge.id)}
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

            {/* Badge Display */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{getBadgeEmoji(badge.icon)}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getRarityColor(badge.rarity) }}
                >
                  {badge.rarity}
                </span>
              </div>
            </div>

            {/* Badge Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-center" style={{ color: '#333' }}>
                {badge.name}
              </h3>

              <p className="text-sm text-center line-clamp-2" style={{ color: '#666' }}>
                {badge.description}
              </p>

              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-xs text-center" style={{ color: '#666' }}>
                  {badge.requirements}
                </p>
              </div>

              {/* Category */}
              <div className="flex justify-center">
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getCategoryColor(badge.category) }}
                >
                  {badge.category}
                </span>
              </div>

              {/* Times Awarded */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-xs mb-1" style={{ color: '#999' }}>
                  {t('badges.timesAwarded', 'Times Awarded')}
                </p>
                <p className="text-xl font-medium" style={{ color: '#C12D32' }}>{badge.timesAwarded.toLocaleString()}</p>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>
              {t('badges.deleteModal.title', 'Delete Badge?')}
            </h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t(
                'badges.deleteModal.body',
                'Are you sure you want to delete this badge? This action cannot be undone.',
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('badges.deleteModal.confirm', 'Delete')}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('badges.deleteModal.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty / Error State */}
      {!loading && (error || filteredBadges.length === 0) && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
          <h3 className="text-xl mb-2" style={{ color: '#333' }}>
            {error
              ? t('badges.empty.errorTitle', 'Unable to load badges')
              : t('badges.empty.noResults', 'No badges found')}
          </h3>
          <p style={{ color: '#666' }}>
            {error
              ? t(
                  'badges.empty.errorBody',
                  'Please check your connection or try again later.',
                )
              : searchTerm || categoryFilter !== 'all' || rarityFilter !== 'all'
                ? t('badges.empty.tryFilters', 'Try adjusting your filters')
                : t(
                    'badges.empty.createFirst',
                    'Create your first badge to get started',
                  )}
          </p>
        </div>
      )}
    </div>
  );
}
