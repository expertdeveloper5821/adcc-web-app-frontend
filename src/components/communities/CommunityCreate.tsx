import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Tag, Settings, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunityForm } from '../hooks/useCommunityForm';
import { createCommunity, updateCommunity, getCommunityById, CommunityApiResponse } from '../../services/communitiesApi';
import { FormField } from './form/FormField';
import { CategorySelector } from './form/CategorySelector';
import { ImageUploader } from './form/ImageUploader';
import { TrackSelector } from './form/TrackSelector';
import { gccCountries } from '../../data/gccLocations';
import { availableCategories } from '../../constants/communityConstants';

interface CommunityCreateProps {
  communityId?: string;
}

export const CommunityCreate: React.FC<CommunityCreateProps> = ({ communityId: propCommunityId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { editingCommunity?: CommunityApiResponse; communityId?: string } | null;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedCommunity, setFetchedCommunity] = useState<CommunityApiResponse | null>(null);

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
    isCompressing,
    communityType,
    availableCities,
    tracks,
    toggleCategory,
    toggleTrack,
    handleImageUpload,
    clearImage,
  } = useCommunityForm({
    initialData: editingCommunity,
    isEditMode,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

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
          toast.error('Failed to load community data');
          navigate('/communities');
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCommunity();
  }, [stateCommunityId, editingCommunity, navigate]);

  const onSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      // Transform form data to API format
      const communityData = {
        title: formData.title,
        description: formData.description,
        type: formData.communityType,
        category: selectedCategories,
        location: `${selectedCity}, ${selectedCountry}`,
        isActive: formData.status === 'active',
        isFeatured: formData.isFeatured,
        area: formData.area,
        country: selectedCountry,
        city: selectedCity,
        communityType: formData.communityType,
        purposeType: formData.purposeType,
        foundedYear: formData.foundedYear,
        ridesThisMonth: formData.ridesThisMonth,
        weeklyRides: formData.weeklyRides,
        fundsRaised: formData.fundsRaised,
        primaryTracks: selectedTrackIds,
        managerName: formData.managerName,
        visibility: formData.visibility,
        joinMode: formData.joinMode,
        displayPriority: formData.displayPriority,
        allowPosts: formData.allowPosts,
        allowGallery: formData.allowGallery,
        status: formData.status,
        image: formData.image,
      };

      let result: CommunityApiResponse;
      
      if (isEditMode && stateCommunityId) {
        result = await updateCommunity(stateCommunityId, communityData);
        toast.success('Community updated successfully');
        navigate(`/communities/${stateCommunityId}`);
      } else {
        result = await createCommunity(communityData);
        toast.success('Community created successfully');
        const id = result._id || result.id;
        navigate(id ? `/communities/${id}` : '/communities');
      }
    } catch (error: any) {
      console.error('Error saving community:', error);
      
      const errorMessage = error?.response?.status === 413
        ? 'Image file is too large. Please use a smaller image.'
        : error?.response?.data?.message || 'Failed to save community';
      
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
          onClick={() => navigate(isEditMode ? -1 : '/communities')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {isEditMode ? 'Edit Community' : 'Create Community'}
          </h1>
          <p style={{ color: '#666' }}>
            {isEditMode ? 'Edit community details' : 'Create a new cycling community'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>1. Basic Information</h2>
            </div>

            <div className="space-y-4">
              <FormField
                label="Community Name"
                name="title"
                register={register}
                error={errors.title}
                required
                placeholder="Abu Dhabi Road Racers"
              />

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Slug (auto-generated)</label>
                <input
                  type="text"
                  value={form.watch('title')?.toLowerCase().replace(/\s+/g, '-') || ''}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  style={{ color: '#999' }}
                />
              </div>

              <FormField
                label="Description"
                name="description"
                register={register}
                error={errors.description}
                required
                as="textarea"
                rows={4}
                placeholder="Describe the community..."
              />

              <FormField
                label="Country"
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
                label="City"
                name="city"
                register={register}
                as="select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                error={errors.city}
                required
              >
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </FormField>

              <FormField
                label="Area (optional)"
                name="area"
                register={register}
                placeholder="e.g., Yas Island, Corniche, Marina..."
              />
            </div>
          </section>

          {/* Community Classification */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>2. Community Classification</h2>
            </div>

            <div className="space-y-4">
              <FormField
                label="Community Type"
                name="communityType"
                register={register}
                as="select"
              >
                <option value="city">City Community</option>
                <option value="type">Interest / Type Community</option>
                <option value="purpose-based">Special Purpose Community</option>
              </FormField>

              <CategorySelector
                selectedCategories={selectedCategories}
                onToggle={toggleCategory}
                error={errors.categories?.message}
                availableCategories={availableCategories}
              />

              {communityType === 'purpose-based' && (
                <FormField
                  label="Special Purpose Type"
                  name="purposeType"
                  register={register}
                  as="select"
                >
                  <option value="">Select special type...</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Charity">Charity</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="National">National Events</option>
                </FormField>
              )}
            </div>
          </section>

          {/* Tracks Mapping */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <TrackSelector
              tracks={tracks}
              selectedTrackIds={selectedTrackIds}
              onToggle={toggleTrack}
              city={selectedCity}
              country={selectedCountry}
            />
          </section>

          {/* Community Stats */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>4. Community Stats Setup</h2>
            </div>

            <div className="space-y-4">
              <FormField
                label="Founded Year"
                name="foundedYear"
                register={register}
                type="number"
                placeholder="2019"
                min={2000}
                max={new Date().getFullYear()}
              />

              {communityType === 'city' && (
                <FormField
                  label="Rides This Month"
                  name="ridesThisMonth"
                  register={register}
                  type="number"
                  placeholder="24"
                  min={0}
                />
              )}

              {communityType === 'type' && (
                <FormField
                  label="Weekly Rides"
                  name="weeklyRides"
                  register={register}
                  type="number"
                  placeholder="6"
                  min={0}
                />
              )}

              {communityType === 'purpose-based' && (
                <FormField
                  label="Funds Raised (AED)"
                  name="fundsRaised"
                  register={register}
                  type="number"
                  placeholder="125000"
                  min={0}
                />
              )}
            </div>
          </section>

          {/* Media */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>5. Media</h2>
            </div>

            <ImageUploader
              imagePreview={imagePreview}
              isUploading={isCompressing}
              onUpload={handleImageUpload}
              onClear={clearImage}
              error={errors.image?.message}
            />
          </section>

          {/* Admin Assignment */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>7. Admin Assignment</h2>
            </div>

            <FormField
              label="Community Manager"
              name="managerName"
              register={register}
              placeholder="Manager name"
            />

            <div className="mt-4">
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Moderators (multi-select)</label>
              <p className="text-xs" style={{ color: '#999' }}>Feature coming soon</p>
            </div>
          </section>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Visibility & Rules */}
          <section className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>6. Visibility & Rules</h3>

            <div className="space-y-4">
              <FormField
                label="Status"
                name="status"
                register={register}
                as="select"
              >
                <option value="inactive">Draft</option>
                <option value="active">Active</option>
              </FormField>

              <FormField
                label="Visibility"
                name="visibility"
                register={register}
                as="select"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </FormField>

              <FormField
                label="Join Mode"
                name="joinMode"
                register={register}
                as="select"
              >
                <option value="open">Open</option>
                <option value="approval">Approval Required</option>
                <option value="invite">Invite Only</option>
              </FormField>

              <FormField
                label="Display Priority"
                name="displayPriority"
                register={register}
                type="number"
                placeholder="0"
                min={0}
              />
              <p className="text-xs mt-1" style={{ color: '#999' }}>Higher numbers appear first</p>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isFeatured')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowPosts')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Allow Posts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowGallery')}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Allow Gallery Uploads</span>
                </label>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>8. Actions</h3>

            <button
              type="submit"
              disabled={isLoading || isCompressing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Update Community' : 'Create & Publish'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(isEditMode ? -1 : '/communities')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};