import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Trophy, Calendar, Target, Users, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getChallengeById,
  createChallenge,
  updateChallenge,
  Challenge,
} from '../../services/challengesApi';
import { getAllCommunities } from '../../services/communitiesApi';
import { getAllBadges, Badge } from '../../services/badgesService';
import { getBadgeEmoji } from '../../data/badgesIcons';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface CommunityItem {
  id: string;
  title: string;
  logo?: string;
}

export function ChallengeCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: challengeId } = useParams<{ id: string }>();
  const isEditMode = !!challengeId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Distance' as Challenge['type'],
    target: 0,
    unit: 'km',
    startDate: '',
    endDate: '',
    rewardBadge: '',
    featured: false,
    status: 'Active' as Challenge['status'],
  });

  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityPage, setCommunityPage] = useState(1);
  const communitiesPerPage = 6;
  const [badges, setBadges] = useState<Badge[]>([]);

  const fetchExisting = useCallback(async () => {
    if (!challengeId) return;
    try {
      const existing = await getChallengeById(challengeId);
      setFormData({
        title: existing.title,
        description: existing.description,
        type: existing.type,
        target: existing.target,
        unit: existing.unit,
        startDate: existing.startDate,
        endDate: existing.endDate,
        rewardBadge: existing.rewardBadge ?? '',
        featured: existing.featured,
        status: existing.status,
      });
      setSelectedCommunities(existing.communities ?? []);
      if (existing.image) setImagePreview(existing.image);
    } catch {
      toast.error(t('challenges.challengeNotFound'));
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  }, [challengeId, navigate, t]);

  useEffect(() => {
    if (isEditMode) fetchExisting();
    else setLoading(false);
  }, [isEditMode, fetchExisting]);

  useEffect(() => {
    getAllCommunities({ limit: 100 })
      .then((list) => {
        setCommunities(
          list.map((c: any) => ({
            id: c._id || c.id || '',
            title: c.title || c.name || '',
            logo: c.logo,
          }))
        );
      })
      .catch(() => toast.error(t('challenges.failedToLoadCommunities')));
  }, [t]);

  useEffect(() => {
    getAllBadges()
      .then((list) => setBadges(list))
      .catch(() => toast.error(t('challenges.failedToLoadBadges')));
  }, [t]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (status: Challenge['status']) => {
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || formData.target <= 0) {
      toast.error(t('challenges.fillRequired'));
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode && challengeId) {
        await updateChallenge(challengeId, {
          ...formData,
          status,
          communities: selectedCommunities,
        }, imageFile || undefined);
        toast.success(t('challenges.successMessage', { action: status === 'Active' ? t('challenges.published') : t('challenges.saved') }));
        navigate(`/challenges/${challengeId}`);
      } else {
        const created = await createChallenge({
          ...formData,
          status,
          participants: 0,
          completions: 0,
          communities: selectedCommunities,
        }, imageFile || undefined);
        toast.success(t('challenges.successMessage', { action: status === 'Active' ? t('challenges.published') : t('challenges.saved') }));
        navigate(`/challenges/${created.id}`);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t('challenges.failedToSave');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCommunities = useMemo(() => {
    if (!communitySearch.trim()) return communities;
    const q = communitySearch.toLowerCase();
    return communities.filter(c => c.title.toLowerCase().includes(q));
  }, [communities, communitySearch]);

  const totalCommunityPages = Math.max(1, Math.ceil(filteredCommunities.length / communitiesPerPage));
  const paginatedCommunities = filteredCommunities.slice(
    (communityPage - 1) * communitiesPerPage,
    communityPage * communitiesPerPage
  );

  const handleTypeChange = (type: Challenge['type']) => {
    setFormData(prev => ({
      ...prev,
      type,
      unit: type === 'Distance' ? 'km' : type === 'Duration' ? 'hours' : type === 'Frequency' ? 'rides' : type === 'Social' ? 'events' : 'rides',
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(isEditMode && challengeId ? `/challenges/${challengeId}` : '/challenges')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {isEditMode ? t('challenges.editChallenge') : t('challenges.createChallenge')}
          </h1>
          <p style={{ color: '#666' }}>
            {isEditMode ? t('challenges.updateInfo') : t('challenges.createNew')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('challenges.basicInfo')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.challengeTitle')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('challenges.titlePlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('challenges.descriptionPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.challengeType')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value as Challenge['type'])}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Distance">{t('challenges.types.Distance')}</option>
                  <option value="Frequency">{t('challenges.types.Frequency')}</option>
                  <option value="Duration">{t('challenges.types.Duration')}</option>
                  <option value="Social">{t('challenges.types.Social')}</option>
                  <option value="Event">{t('challenges.types.Event')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('challenges.challengeTarget')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.targetValue')}</label>
                <input
                  type="number"
                  value={formData.target || ''}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  min={1}
                  placeholder="500"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.unit')}</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="km"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
              <p className="text-sm" style={{ color: '#666' }}>
                {t('challenges.targetHint', { target: formData.target, unit: formData.unit }).replace(/<\/?strong>/g, '')}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('challenges.challengeSchedule')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.startDate')}</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.endDate')}</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-sm text-red-500">{formData.startDate > formData.endDate ? t('challenges.startDateMustBeBeforeEndDate') : ''}</p>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('challenges.rewards')}</h2>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('challenges.rewardBadge')}</label>
              <select
                value={formData.rewardBadge}
                onChange={(e) => setFormData({ ...formData, rewardBadge: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">{t('challenges.selectBadge')}</option>
                {badges.map(badge => (
                  <option key={badge.id} value={badge.id}>
                    {getBadgeEmoji(badge.icon)} {badge.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Communities */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>{t('challenges.assignCommunities')}</h2>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input
                  type="text"
                  value={communitySearch}
                  onChange={(e) => { setCommunitySearch(e.target.value); setCommunityPage(1); }}
                  placeholder={t('challenges.searchCommunities')}
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 w-52"
                />
              </div>
            </div>

            <div className="space-y-2">
              {paginatedCommunities.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: '#999' }}>
                  {communitySearch ? t('challenges.noCommunitiesMatch') : t('challenges.noCommunitiesAvailable')}
                </p>
              ) : (
                paginatedCommunities.map(community => (
                  <label key={community.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCommunities.includes(community.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommunities(prev => [...prev, community.id]);
                        } else {
                          setSelectedCommunities(prev => prev.filter(c => c !== community.id));
                        }
                      }}
                      className="w-4 h-4"
                      style={{ accentColor: '#C12D32' }}
                    />
                    {community.logo && (
                      <img src={community.logo} alt={community.title} className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <span className="text-sm" style={{ color: '#333' }}>{community.title}</span>
                  </label>
                ))
              )}
            </div>

            {totalCommunityPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCommunityPage(p => Math.max(1, p - 1))}
                  disabled={communityPage <= 1}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: '#666' }}
                >
                  <ChevronLeft className="w-4 h-4" /> {t('challenges.prev')}
                </button>
                <span className="text-xs" style={{ color: '#999' }}>
                  {communityPage} / {totalCommunityPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCommunityPage(p => Math.min(totalCommunityPages, p + 1))}
                  disabled={communityPage >= totalCommunityPages}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: '#666' }}
                >
                  {t('challenges.next')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedCommunities.length > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-sm" style={{ color: '#666' }}>
                  {t('challenges.visibleTo', { count: selectedCommunities.length })}
                </p>
              </div>
            )}
          </div>

          {/* Challenge Image */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('challenges.challengeImage')}</h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Challenge preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: '#C12D32' }} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#ECC180' }}
              >
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.uploadImage')}</p>
                <p className="text-xs mt-1" style={{ color: '#999' }}>{t('challenges.imageHint')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          {isEditMode && (
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.status')}</h3>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Challenge['status'] })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="Active">{t('challenges.statusLabels.Active')}</option>
                <option value="Upcoming">{t('challenges.statusLabels.Upcoming')}</option>
                <option value="Completed">{t('challenges.statusLabels.Completed')}</option>
                <option value="Draft">{t('challenges.statusLabels.Draft')}</option>
              </select>
            </div>
          )}

          {/* Visibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.visibility')}</h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
                style={{ accentColor: '#C12D32' }}
              />
              <span className="text-sm" style={{ color: '#666' }}>{t('challenges.featuredChallenge')}</span>
            </label>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
              <p className="text-xs" style={{ color: '#666' }}>
                {t('challenges.featuredHint')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={() => handleSubmit(isEditMode ? formData.status : 'Active')}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#C12D32' }}
            >
              {submitting ? t('challenges.saving') : isEditMode ? t('challenges.updateChallenge') : t('challenges.publishChallenge')}
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              {t('challenges.saveAsDraft')}
            </button>
            <button
              onClick={() => navigate(isEditMode && challengeId ? `/challenges/${challengeId}` : '/challenges')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              {t('challenges.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
