import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Tag, Settings, Shield, Save, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCommunityForm } from '../hooks/useCommunityForm';
import { createCommunity, updateCommunity, getCommunityById, CommunityApiResponse, COMMUNITY_LOCATION_OPTIONS } from '../../services/communitiesApi';
import { FormField } from './form/FormField';
import { CategorySelector } from './form/CategorySelector';
import { TrackSelector } from './form/TrackSelector';
import { gccCountries } from '../../data/gccLocations';
import { availableCategories } from '../../constants/communityConstants';
import { useLocale } from '../../contexts/LocaleContext';

interface CommunityCreateProps {
  communityId?: string;
}

export const CommunityCreate: React.FC<CommunityCreateProps> = ({ communityId: propCommunityId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const locationState = location.state as { editingCommunity?: CommunityApiResponse; communityId?: string } | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedCommunity, setFetchedCommunity] = useState<CommunityApiResponse | null>(null);
  const { locale } = useLocale();

  const stateCommunityId = propCommunityId || locationState?.communityId;
  const editingCommunity = locationState?.editingCommunity || fetchedCommunity;
  const isEditMode = !!editingCommunity && !!stateCommunityId;

  const {
    form,
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
    selectedCategories,
    selectedTrackIds,
    imagePreview,
    logoPreview,
    isCompressing,
    communityType,
    availableCities,
    tracks,
    tracksLoading,
    toggleCategory,
    toggleTrack,
    handleImageUpload,
    clearImage,
    handleLogoUpload,
    clearLogo,
  } = useCommunityForm({
    initialData: editingCommunity,
    isEditMode,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;
console.log('errorss',errors);
  // Fetch community data if ID is provided
  useEffect(() => {
    const fetchCommunity = async () => {
      if (stateCommunityId && !editingCommunity) {
        try {
          setIsFetching(true);
          const data = await getCommunityById(stateCommunityId);
          setFetchedCommunity(data);
        } catch (error) {
          console.error('Error fetching community:', error);
          toast.error(t('communities.create.toasts.loadError'));
          navigate('/communities');
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCommunity();
  }, [stateCommunityId, editingCommunity, navigate]);

  // Backend accepts only these fields (createCommunitySchema/updateCommunitySchema are strict)
  const ALLOWED_LOCATIONS = ['Abu Dhabi', 'Dubai', 'Al Ain', 'Sharjah'] as const;

  const isValidMongoId = (val: string | undefined): boolean =>
    !!val && /^[a-fA-F0-9]{24}$/.test(val);

  const onSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // Backend: location must be one of "Abu Dhabi"|"Dubai"|"Al Ain"|"Sharjah"
      const location = COMMUNITY_LOCATION_OPTIONS.includes(selectedCity as any)
        ? selectedCity
        : COMMUNITY_LOCATION_OPTIONS[0];

      // Build payload to match backend validation; include primary track IDs from database
      const communityData = {
        title: formData.title,
        description: formData.description,
        ...(formData.titleAr ? { titleAr: formData.titleAr } : {}),
        ...(formData.descriptionAr ? { descriptionAr: formData.descriptionAr } : {}),
        type: Array.isArray(selectedCategories) && selectedCategories.length > 0
          ? selectedCategories
          : [formData.communityType || 'city'],
        category: Array.isArray(selectedCategories) ? selectedCategories.join(', ') : '',
        location,
        image: formData.image || undefined,
        isActive: formData.status === 'active',
        isFeatured: formData.isFeatured ?? false,
        logo: formData.logo || undefined,
        // Backend accepts a single track ID as string
        trackId: selectedTrackIds?.[0] ?? undefined,
        purposeType: formData.purposeType ?? '',
        ridesThisMonth: String(formData.ridesThisMonth ?? ''),
        weeklyRides: String(formData.weeklyRides ?? ''),
        fundsRaised: String(formData.fundsRaised ?? ''),
        foundedYear: formData.foundedYear ?? undefined,
        area: formData.area || undefined,
        manager: formData.managerName || undefined,
      };

      if (import.meta.env.DEV) {
        console.log('Community payload:', JSON.stringify(communityData, null, 2));
      }

      let result: CommunityApiResponse;

      if (isEditMode && stateCommunityId) {
        result = await updateCommunity(stateCommunityId, communityData);
        toast.success(t('communities.create.toasts.updateSuccess'));
        navigate(`/communities/${stateCommunityId}`);
      } else {
        result = await createCommunity(communityData);
        toast.success(t('communities.create.toasts.createSuccess'));
        const id = result._id || result.id;
        navigate(id ? `/communities/${id}` : '/communities');
      }
    } catch (error: any) {
      console.error('Error saving community:', error);

      const errorMessage =
        error?.response?.status === 413
          ? t('communities.create.toasts.imageTooLarge')
          : error?.response?.data?.message || t('communities.create.toasts.saveError');

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (isEditMode ? navigate(-1) : navigate('/communities'))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {isEditMode ? t('communities.create.titleEdit') : t('communities.create.titleCreate')}
          </h1>
          <p style={{ color: '#666' }}>
            {isEditMode ? t('communities.create.subtitleEdit') : t('communities.create.subtitleCreate')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.create.basicInfo')}</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              <FormField
                label={t('communities.create.communityName')}
                name="title"
                register={register}
                error={errors.title}
                required
                placeholder={t('communities.create.placeholders.communityName')}
              />

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.create.slug')}</label>
                <input
                  type="text"
                  value={String(form.watch('title') ?? '').toLowerCase().replace(/\s+/g, '-')}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  style={{ color: '#999' }}
                />
              </div>

              <FormField
                label={t('communities.create.description')}
                name="description"
                register={register}
                error={errors.description}
                required
                as="textarea"
                rows={4}
                placeholder={t('communities.create.placeholders.description')}
              />
            </div>

            {/* Arabic Fields */}
            <div className="space-y-4" style={{ display: locale === 'ar' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  اسم المجتمع <span className="text-gray-400">(Community Name)</span>
                </label>
                <input
                  {...register('titleAr')}
                  dir="rtl"
                  lang="ar"
                  placeholder="أبوظبي لسباق الطرق"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.titleAr ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-red-600`}
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
                {errors.titleAr && (
                  <p className="mt-1 text-sm text-red-600">{errors.titleAr.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  الوصف <span className="text-gray-400">(Description)</span>
                </label>
                <textarea
                  {...register('descriptionAr')}
                  dir="rtl"
                  lang="ar"
                  rows={4}
                  placeholder="وصف المجتمع..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.descriptionAr ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-red-600`}
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
                {errors.descriptionAr && (
                  <p className="mt-1 text-sm text-red-600">{errors.descriptionAr.message}</p>
                )}
              </div>

              {/* English reference */}
              {form.watch('title') && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Globe className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-400 mb-1">{t('common.englishReference')}</p>
                    <p className="text-sm text-gray-700">{form.watch('title')}</p>
                    {form.watch('description') && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{form.watch('description')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Common fields (always visible) */}
            <div className="space-y-4 mt-4">
              <FormField
                label={t('communities.create.country')}
                name="country"
                register={register}
                as="select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as any)}
              >
                {gccCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </FormField>

              <FormField
                label={t('communities.create.city')}
                name="city"
                register={register}
                as="select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                error={errors.city}
                required
              >
                {availableCities.map(city => (
                  <option key={city} value={city}>{t(`data.locations.${city}`, city)}</option>
                ))}
              </FormField>

              <FormField
                label={t('communities.create.area')}
                name="area"
                register={register}
                placeholder={t('communities.create.placeholders.area')}
              />
            </div>
          </section>

          {/* Community Classification */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.create.classification')}</h2>
            </div>

            <div className="space-y-4">
              <FormField
                label={t('communities.create.communityType')}
                name="communityType"
                register={register}
                as="select"
              >
                <option value="city">{t('communities.create.typeOptions.city')}</option>
                <option value="type">{t('communities.create.typeOptions.interest')}</option>
                <option value="purpose-based">{t('communities.create.typeOptions.specialPurpose')}</option>
              </FormField>

              <CategorySelector
                selectedCategories={selectedCategories}
                onToggle={toggleCategory}
                error={errors.categories?.message}
                availableCategories={availableCategories}
              />

              {communityType === 'purpose-based' && (
                <FormField
                  label={t('communities.create.specialPurposeType')}
                  name="purposeType"
                  register={register}
                  as="select"
                >
                  <option value="">{t('communities.create.specialPurposeOptions.select')}</option>
                  <option value="Awareness">{t('communities.create.specialPurposeOptions.awareness')}</option>
                  <option value="Charity">{t('communities.create.specialPurposeOptions.charity')}</option>
                  <option value="Corporate">{t('communities.create.specialPurposeOptions.corporate')}</option>
                  <option value="Education">{t('communities.create.specialPurposeOptions.education')}</option>
                  <option value="Health">{t('communities.create.specialPurposeOptions.health')}</option>
                  <option value="National">{t('communities.create.specialPurposeOptions.nationalEvents')}</option>
                </FormField>
              )}
            </div>
          </section>

          {/* Tracks Mapping - loaded from database */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            {tracksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
                <span className="ml-3 text-sm" style={{ color: '#666' }}>Loading tracks...</span>
              </div>
            ) : (
              <TrackSelector
                tracks={tracks}
                selectedTrackIds={selectedTrackIds}
                onToggle={toggleTrack}
                city={selectedCity}
                country={selectedCountry}
              />
            )}
          </section>

          {/* Community Stats */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.create.stats')}</h2>
            </div>

            <div className="space-y-4">
              <FormField
                label={t('communities.create.foundedYear')}
                name="foundedYear"
                register={register}
                type="number"
                placeholder={t('communities.create.placeholders.foundedYear')}
                min={2000}
                max={new Date().getFullYear()}
              />

              {communityType === 'city' && (
                <FormField
                  label={t('communities.create.ridesThisMonth')}
                  name="ridesThisMonth"
                  register={register}
                  type="number"
                  placeholder={t('communities.create.placeholders.ridesThisMonth')}
                  min={0}
                />
              )}

              {communityType === 'type' && (
                <FormField
                  label={t('communities.create.weeklyRides')}
                  name="weeklyRides"
                  register={register}
                  type="number"
                  placeholder={t('communities.create.placeholders.weeklyRides')}
                  min={0}
                />
              )}

              {communityType === 'purpose-based' && (
                <FormField
                  label={t('communities.create.fundsRaised')}
                  name="fundsRaised"
                  register={register}
                  type="number"
                  placeholder={t('communities.create.placeholders.fundsRaised')}
                  min={0}
                />
              )}
            </div>
          </section>

          {/* Media - Community Logo & Cover Image */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.create.media')}</h2>
            </div>

            <div className="space-y-6">
              {/* Community Logo */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Logo</label>
                <input
                  id="community-logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  disabled={isCompressing}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleLogoUpload(file);
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="community-logo-upload"
                  className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  {isCompressing && !logoPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: '#C12D32' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Compressing...</p>
                    </div>
                  ) : logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="mx-auto rounded-lg max-h-32 w-32 object-cover"
                      />
                      <p className="text-xs mt-2" style={{ color: '#666' }}>Click to change logo</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Upload community logo</p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Square format recommended</p>
                    </>
                  )}
                </label>
                {logoPreview && !isCompressing && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="mt-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    style={{ color: '#666' }}
                  >
                    Remove logo
                  </button>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image</label>
                <input
                  id="community-cover-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  disabled={isCompressing}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="community-cover-upload"
                  className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  {isCompressing && !imagePreview ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: '#C12D32' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Compressing...</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="mx-auto rounded-lg w-full max-h-48 object-cover"
                      />
                      <p className="text-xs mt-2" style={{ color: '#666' }}>Click to change cover image</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Upload cover image</p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 16:9 format recommended</p>
                    </>
                  )}
                </label>
                {imagePreview && !isCompressing && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="mt-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    style={{ color: '#666' }}
                  >
                    Remove cover image
                  </button>
                )}
                {errors.image?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Admin Assignment */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.create.adminAssignment')}</h2>
            </div>

            <FormField
              label={t('communities.create.communityManager')}
              name="managerName"
              register={register}
              placeholder={t('communities.create.placeholders.manager')}
            />

            <div className="mt-4">
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.create.moderators')}</label>
              <p className="text-xs" style={{ color: '#999' }}>{t('communities.create.featureComingSoon')}</p>
            </div>
          </section>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Visibility & Rules */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.create.visibilityRules')}</h3>

            <div className="space-y-4">
              <FormField
                label={t('communities.create.status')}
                name="status"
                register={register}
                as="select"
              >
                <option value="inactive">{t('communities.create.statusOptions.draft')}</option>
                <option value="active">{t('communities.create.statusOptions.active')}</option>
              </FormField>

              <FormField
                label={t('communities.create.visibility')}
                name="visibility"
                register={register}
                as="select"
              >
                <option value="public">{t('communities.create.visibilityOptions.public')}</option>
                <option value="private">{t('communities.create.visibilityOptions.private')}</option>
              </FormField>

              <FormField
                label={t('communities.create.joinMode')}
                name="joinMode"
                register={register}
                as="select"
              >
                <option value="open">{t('communities.create.joinModeOptions.open')}</option>
                <option value="approval">{t('communities.create.joinModeOptions.approvalRequired')}</option>
                <option value="invite">{t('communities.create.joinModeOptions.inviteOnly')}</option>
              </FormField>

              <FormField
                label={t('communities.create.displayPriority')}
                name="displayPriority"
                register={register}
                type="number"
                placeholder={t('communities.create.placeholders.displayPriority')}
                min={0}
              />
              <p className="text-xs mt-1" style={{ color: '#999' }}>{t('communities.create.displayPriorityHint')}</p>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isFeatured')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.create.featuredHomepage')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowPosts')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.create.allowPosts')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowGallery')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.create.allowGallery')}</span>
                </label>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.create.actions')}</h3>

            <button
              type="submit"
              disabled={isLoading || isCompressing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEditMode ? t('communities.create.updating') : t('communities.create.creating')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? t('communities.create.updateCommunity') : t('communities.create.createPublish')}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => (isEditMode ? navigate(-1) : navigate('/communities'))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              {t('common.cancel')}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};