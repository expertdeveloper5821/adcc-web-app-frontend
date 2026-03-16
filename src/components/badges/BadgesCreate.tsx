import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Badge, createBadgeApi, updateBadgeApi, getBadgeById } from '../../services/badgesService';
import { BADGE_ICON_OPTIONS, getBadgeEmoji } from '../../data/badgesIcons';

interface BadgesCreateProps {
  navigate: (page: string, params?: any) => void;
  badgeId?: string;
}

export function BadgesCreate({ navigate, badgeId }: BadgesCreateProps) {
  const routerNavigate = useNavigate();
  const { t } = useTranslation();
  const isEditMode = !!badgeId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: '',
    icon: 'trophy',
    category: 'Distance' as Badge['category'],
    rarity: 'Common' as Badge['rarity'],
    timesAwarded: 0,
  });

  const iconsToShow = BADGE_ICON_OPTIONS;

  useEffect(() => {
    const loadBadge = async () => {
      if (!isEditMode || !badgeId) return;
      try {
        setInitialLoading(true);
        const existingBadge = await getBadgeById(badgeId);
        setFormData({
          name: existingBadge.name,
          description: existingBadge.description,
          requirements: existingBadge.requirements,
          icon: existingBadge.icon || 'trophy',
          category: existingBadge.category,
          rarity: existingBadge.rarity,
          timesAwarded: existingBadge.timesAwarded,
        });
      } catch (error: any) {
        console.error('Error loading badge:', error);
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          t('badges.toasts.loadError', 'Failed to load badge. Please try again.')
        );
        routerNavigate('/badges');
      } finally {
        setInitialLoading(false);
      }
    };

    loadBadge();
  }, [badgeId, isEditMode, routerNavigate]);

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.description?.trim() || !formData.requirements?.trim()) {
      toast.error(
        t('badges.toasts.missingRequired', 'Please fill in all required fields'),
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        icon: formData.icon,
        category: formData.category,
        rarity: formData.rarity,
        timesAwarded: formData.timesAwarded,
      };

      if (isEditMode && badgeId) {
        await updateBadgeApi(badgeId, payload);
        toast.success(
          t('badges.toasts.updateSuccess', 'Badge updated successfully'),
        );
      } else {
        await createBadgeApi(payload);
        toast.success(
          t('badges.toasts.createSuccess', 'Badge created successfully'),
        );
      }

      routerNavigate('/badges');
    } catch (error: any) {
      console.error('Error saving badge:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('badges.toasts.saveError', 'Failed to save badge. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (isEditMode && badgeId) {
              routerNavigate(`/badges`);
            } else {
              routerNavigate('/badges');
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {isEditMode
              ? t('badges.create.titleEdit', 'Edit Badge')
              : t('badges.create.titleCreate', 'Create Badge')}
          </h1>
          <p style={{ color: '#666' }}>
            {isEditMode
              ? t('badges.create.subtitleEdit', 'Update achievement badge')
              : t('badges.create.subtitleCreate', 'Create a new achievement badge')}
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
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>
                {t('badges.create.basicInfo', 'Basic Information')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('badges.create.nameLabel', 'Badge Name *')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t(
                    'badges.create.namePlaceholder',
                    'e.g., 100km Champion',
                  )}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('badges.create.descriptionLabel', 'Description *')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t(
                    'badges.create.descriptionPlaceholder',
                    'Describe what this badge represents...',
                  )}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('badges.create.iconLabel', 'Icon *')}
                </label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {iconsToShow.map((badgeIcon) => (
                    <button
                      key={badgeIcon.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: badgeIcon.key })}
                      className={`p-3 rounded-lg text-2xl transition-all ring-2 ${
                        formData.icon === badgeIcon.key
                          ? 'ring-red-600'
                          : 'ring-transparent hover:ring-gray-200'
                      }`}
                      style={{
                        backgroundColor: formData.icon === badgeIcon.key ? '#FFF9EF' : 'transparent',
                      }}
                    >
                      {badgeIcon.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('badges.create.requirementsLabel', 'Requirements *')}
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder={t(
                    'badges.create.requirementsPlaceholder',
                    'e.g., Complete 100km in total distance',
                  )}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

            </div>
          </div>

          {/* Classification */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>
              {t('badges.create.classification', 'Classification')}
            </h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-2" style={{ color: '#666' }}>
                          {t('badges.create.categoryLabel', 'Category *')}
                        </label>
                        <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Badge['category'] })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600">
                            <option value="Distance">
                              {t('badges.categories.Distance', 'Distance')}
                            </option>
                            <option value="Event">
                              {t('badges.categories.Event', 'Event')}
                            </option>
                            <option value="Social">
                              {t('badges.categories.Social', 'Social')}
                            </option>
                            <option value="Achievement">
                              {t('badges.categories.Achievement', 'Achievement')}
                            </option>
                            <option value="Special">
                              {t('badges.categories.Special', 'Special')}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-2" style={{ color: '#666' }}>
                          {t('badges.create.rarityLabel', 'Rarity *')}
                        </label>
                            <select
                            value={formData.rarity}
                            onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Badge['rarity'] })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600">
                                <option value="Common">
                                  {t('badges.rarities.Common', 'Common')}
                                </option>
                                <option value="Rare">
                                  {t('badges.rarities.Rare', 'Rare')}
                                </option>
                                <option value="Epic">
                                  {t('badges.rarities.Epic', 'Epic')}
                                </option>
                                <option value="Legendary">
                                  {t('badges.rarities.Legendary', 'Legendary')}
                                </option>
                            </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm mb-2" style={{ color: '#666' }}>
                      {t('badges.create.pointsLabel', 'Points Required')}
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.timesAwarded}
                        onChange={(e) => setFormData({ ...formData, timesAwarded: Number(e.target.value) || 0 })}
                        placeholder={t('badges.create.pointsPlaceholder', '0')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                </div>
            </div>
        </div>
        </div>

        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>
                  {t('badges.create.previewTitle', 'Preview')}
                </h3>
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                    <div className="text-center">
                        <div className="text-6xl mb-3">{getBadgeEmoji(formData.icon)}</div>
                        <div className="flex justify-center gap-2 mb-3 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#6B7280' }}>
                              {t(`badges.rarities.${formData.rarity}`, formData.rarity)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#3B82F6' }}>
                              {t(`badges.categories.${formData.category}`, formData.category)}
                            </span>
                        </div>
                        <h3 className="text-lg mb-2" style={{ color: '#333' }}>
                          {formData.name || t('badges.create.previewName', 'Badge Name')}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: '#666' }}>
                          {formData.description ||
                            t(
                              'badges.create.previewDescription',
                              'Badge description',
                            )}
                        </p>
                        <p className="text-xs" style={{ color: '#999' }}>
                          {formData.requirements ||
                            t('badges.create.previewRequirements', 'Requirements')}
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>
                  {t('badges.create.actionsTitle', 'Actions')}
                </h3>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#C12D32' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save w-5 h-5"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg>
                  {isEditMode
                    ? t('badges.create.updateButton', 'Update Badge')
                    : t('badges.create.createButton', 'Create Badge')}
                </button>
            <button className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50" 
            style={{ color: '#666' }}
            onClick={() => routerNavigate('/badges')}>
                {t('common.cancel')}
            </button>
                </div>
        </div>
      </div>
  
    </div>
  );
}