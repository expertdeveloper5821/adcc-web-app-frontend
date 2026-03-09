import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Settings, Award, Image as ImageIcon, Save, Plus, X, Globe } from 'lucide-react';
import { addEvent, Event, availableCategories } from '../../data/eventsData';
import { getTracksByCountryAndCity } from '../../data/tracksData';
import { toast } from 'sonner';
import { getAllTracks, deleteTrack } from '../../services/trackService';
import { createEvent, EventApiResponse } from '../../services/eventsApi';
import { getAllCommunities, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { Input } from '../ui/input';
import { UserRole } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '../../contexts/LocaleContext';
import { useTranslation } from 'react-i18next';

interface EventCreateProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventCreate({ role }: EventCreateProps) {

  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { locale } = useLocale();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    setThumbnailImage(e.target.files[0]);
  }
};

const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    const file = e.target.files[0];
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }
};

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // Optional: limit max images (10)
    if (galleryImages.length + files.length > 10) {
      alert(t('events.create.maxImagesAlert'));
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));

    setGalleryImages(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);

    // Reset input so same file can be selected again
    e.target.value = '';
  };


  const removeGalleryImage = (index: number) => {
    const updatedImages = [...galleryImages];
    const updatedPreviews = [...galleryPreviews];

    // Clean memory
    URL.revokeObjectURL(updatedPreviews[index]);

    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setGalleryImages(updatedImages);
    setGalleryPreviews(updatedPreviews);
  };

  const [formData, setFormData] = useState<{
    title: string;
    titleAr: string;
    slug: string;
    category: string;
    communityId: string;
    description: string;
    descriptionAr: string;
    country: string;
    city: string;
    trackId: string;
    eventDate: string;
    eventTime: string;
    endTime: string;
    distance: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    maxParticipants: number;
    schedule: { time: string; title: string }[];
    amenities: string[];
    eligibilityAge: string;
    eligibilityBike: string;
    eligibilityExperience: string;
    rewardPoints: number;
    rewardBadge: string;
    status: 'Draft' | 'Open';
    isFeatured: boolean;
    allowCancellation: boolean;
  }>({
    title: '',
    titleAr: '',
    slug: '',
    category: 'Community Ride',
    communityId: '',
    description: '',
    descriptionAr: '',
    country: 'UAE',
    city: 'Abu Dhabi',
    trackId: '',
    eventDate: '',
    eventTime: '06:00',
    endTime: '08:00',
    distance: 25,
    difficulty: 'Medium',
    maxParticipants: 100,
    schedule: [{ time: '06:00', title: '' }],
    amenities: [],
    eligibilityAge: 18,
    eligibilityBike: 'Any',
    eligibilityExperience: 'Beginner',
    rewardPoints: 50,
    rewardBadge: '',
    status: 'Draft',
    isFeatured: false,
    allowCancellation: true,
  });

  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // const tracks = getTracksByCountryAndCity(formData.country, formData.city);
  // const selectedCommunity = communities.find(c => c.id === formData.communityId);

  // Community records 
    useEffect(() => {
      const fetchMetaData = async () => {
        try {
          const [communityData, trackData] = await Promise.all([
            getAllCommunities(),
            getAllTracks(),
          ]);
  
          setCommunities(Array.isArray(communityData) ? communityData : []);
          setTracks(Array.isArray(trackData) ? trackData : []);
        } catch (error) {
          toast.error(t('events.create.toasts.loadError'));
        }
      };
  
      fetchMetaData();
    }, []);

  // Predefined amenities that appear as checkboxes
  const predefinedAmenities = ['water', 'toilets', 'parking', 'lighting', 'medical support', 'bike service'];
  
  // Custom amenities (those not in the predefined list)
  const customAmenities = formData.amenities.filter(a => !predefinedAmenities.includes(a));

  const handleNameChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addScheduleRow = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', title: '' }],
    }));
  };

  const removeScheduleRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const updateScheduleRow = (index: number, field: 'time' | 'title', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Helper function to compress and resize image before converting to base64
  // More aggressive compression to prevent payload too large errors
  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, maxBase64Size: number = 500 * 1024): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Validate file size (max 10MB before compression)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error('Image size should be less than 10MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions (more aggressive resizing)
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Use better image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Always convert to JPEG for better compression, regardless of input format
          // Try different quality levels until we get under the size limit
          const qualities = [0.7, 0.5, 0.4, 0.3, 0.2, 0.15];
          let bestBase64 = '';
          let bestSize = Infinity;

          for (const quality of qualities) {
            // Always use JPEG format for maximum compression
            const base64String = canvas.toDataURL('image/jpeg', quality);
            // Base64 string size is approximately 4/3 of the original size
            const base64Size = (base64String.length * 3) / 4;
            
            if (base64Size <= maxBase64Size) {
              resolve(base64String);
              return;
            }
            
            // Keep track of the smallest we've seen
            if (base64Size < bestSize) {
              bestSize = base64Size;
              bestBase64 = base64String;
            }
          }

          // If we still couldn't get under the limit, use the best we have
          // but warn the user
          if (bestBase64) {
            console.warn(`Image compressed to ${Math.round(bestSize / 1024)}KB, which may still be large`);
            resolve(bestBase64);
          } else {
            reject(new Error('Image is too large even after compression. Please use a smaller image.'));
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) errors.title = t('events.create.toasts.missingRequired');
    if (!formData.description.trim()) errors.description = t('events.create.toasts.missingRequired');
    if (!formData.eventDate) errors.eventDate = t('events.create.toasts.missingRequired');
    return errors;
  };

  const handleSubmit = async (action: 'draft' | 'publish') => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(t('events.create.toasts.missingRequired'));
      return;
    } else {
      setFormErrors({});
    }
    try {
      // Convert images to base64
      let coverBase64 = '';
      let galleryBase64: string[] = [];

      if (coverImage) {
        coverBase64 = await compressImage(coverImage);
      }
      if (galleryImages.length > 0) {
        galleryBase64 = await Promise.all(galleryImages.map(img => compressImage(img)));
      }

      // Prepare payload with correct types and only allowed fields
      const payload: Partial<EventApiResponse> = {
        title: formData.title,
        ...(formData.titleAr?.trim() ? { titleAr: formData.titleAr.trim() } : {}),
        slug: formData.slug,
        category: formData.category,
        communityId: formData.communityId,
        description: formData.description,
        ...(formData.descriptionAr?.trim() ? { descriptionAr: formData.descriptionAr.trim() } : {}),
        address: `${formData.city}, ${formData.country}`,
        trackId: formData.trackId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        endTime: formData.endTime,
        distance: Number(formData.distance),
        difficulty: formData.difficulty,
        maxParticipants: Number(formData.maxParticipants),
        schedule: Array.isArray(formData.schedule)
          ? formData.schedule.filter((s) => s.time && s.title?.trim())
          : [],
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        mainImage: coverBase64 || undefined,
        galleryImages: galleryBase64,
        status: action === 'draft' ? 'Draft' : 'Open',
        isFeatured: !!formData.isFeatured,
        allowCancellation: !!formData.allowCancellation,
      };

      await createEvent(payload);
      toast.success(t('events.create.toasts.createSuccess'));
      navigate('/events');
    } catch (error) {
      toast.error(t('events.create.toasts.createError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/events`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('events.create.title')}</h1>
          <p style={{ color: '#666' }}>{t('events.create.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A - Basic Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.basicInfo')}</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.eventName')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('events.create.placeholders.eventName')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {formErrors.title && <div className="text-xs text-red-600 mt-1">{formErrors.title}</div>}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.slug')}</label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  style={{ color: '#999' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('events.create.placeholders.description')}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {formErrors.description && <div className="text-xs text-red-600 mt-1">{formErrors.description}</div>}
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="space-y-4" style={{ display: locale === 'ar' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  اسم الحدث <span className="text-gray-400">(Event Name)</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  placeholder="سلسلة سباقات أبوظبي الليلية - الجولة 3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  الوصف <span className="text-gray-400">(Description)</span>
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  rows={4}
                  placeholder="وصف الحدث..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
              </div>

              {/* English reference */}
              {formData.title && (
                <div className="p-3 rounded-lg border" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                    <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>{t('common.englishReference')}</span>
                  </div>
                  <p className="text-sm" style={{ color: '#1E40AF' }}>{formData.title}</p>
                  {formData.description && (
                    <p className="text-xs mt-1" style={{ color: '#60A5FA' }}>{formData.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Common fields always visible */}
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.category')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.community')}</label>
                <select
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">{t('events.create.placeholders.community')}</option>
                  {communities.map(community => (
                    <option key={community.id || community._id} value={community.id || community._id}>{community.title || community.name}</option>
                  ))}
                </select>
                {formErrors.communityId && <div className="text-xs text-red-600 mt-1">{formErrors.communityId}</div>}
              </div>
            </div>
          </div>

          {/* SECTION B - Location & Track */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.locationTrack')}</h2>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.track')}</label>
              <select
                value={formData.trackId}
                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">{t('events.create.placeholders.track')}</option>
                {tracks.map(track => (
                  <option key={track.id || track._id} value={track.id || track._id}>{track.title}</option>
                ))}
                
              </select>
            </div>
          </div>

          {/* SECTION C - Date & Time */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.dateTime')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.eventDate')}</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.startTime')}</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.endTime')}</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION D - Ride Details */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.rideDetails')}</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.distance')}</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })}
                    placeholder={t('events.create.placeholders.distance')}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.difficulty')}</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Easy">{t('events.create.difficultyOptions.easy')}</option>
                    <option value="Medium">{t('events.create.difficultyOptions.medium')}</option>
                    <option value="Hard">{t('events.create.difficultyOptions.hard')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.maxParticipants')}</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    placeholder={t('events.create.placeholders.maxParticipants')}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.registrationFee')}</label>
                  <input
                    type="text"
                    value="FREE"
                    readOnly
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                    style={{ color: '#999' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION E - Event Schedule */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.schedule')}</h2>
            </div>

            <div className="space-y-3">
              {formData.schedule.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => updateScheduleRow(index, 'time', e.target.value)}
                    placeholder="05:00"
                    className="w-32 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateScheduleRow(index, 'title', e.target.value)}
                    placeholder={t('events.create.placeholders.scheduleActivity')}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  {formData.schedule.length > 1 && (
                    <button
                      onClick={() => removeScheduleRow(index)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" style={{ color: '#999' }} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addScheduleRow}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                <Plus className="w-4 h-4" />
                {t('events.create.addScheduleRow')}
              </button>
            </div>
          </div>

          {/* SECTION F - Amenities */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.amenities')}</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedAmenities.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{amenity}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                placeholder={t('events.create.placeholders.customAmenity')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                onClick={() => {
                  if (customAmenityInput.trim()) {
                    toggleAmenity(customAmenityInput.trim());
                    setCustomAmenityInput('');
                  }
                }}
                className="mt-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                {t('events.create.addCustomAmenity')}
              </button>
            </div>

            {customAmenities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold" style={{ color: '#333' }}>{t('events.create.customAmenities')}</h3>
                <div className="space-y-2">
                  {customAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: '#666' }}>{amenity}</span>
                      <button
                        onClick={() => toggleAmenity(amenity)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: '#999' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION G - Eligibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.eligibility')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.ageRequirement')}</label>
                <input
                  type="text"
                  value={formData.eligibilityAge}
                  onChange={(e) => setFormData({ ...formData, eligibilityAge: Number(e.target.value) })}
                  placeholder={t('events.create.placeholders.ageRequirement')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.bikeType')}</label>
                <input
                  type="text"
                  value={formData.eligibilityBike}
                  onChange={(e) => setFormData({ ...formData, eligibilityBike: e.target.value })}
                  placeholder={t('events.create.placeholders.bikeType')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.experienceLevel')}</label>
                <select
                  value={formData.eligibilityExperience}
                  onChange={(e) => setFormData({ ...formData, eligibilityExperience: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Beginner">{t('events.create.experienceOptions.beginner')}</option>
                  <option value="Intermediate">{t('events.create.experienceOptions.intermediate')}</option>
                  <option value="Advanced">{t('events.create.experienceOptions.advanced')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION H - Rewards & Badges */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.rewards')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.pointsReward')}</label>
                <input
                  type="number"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: Number(e.target.value) || 0 })}
                  placeholder={t('events.create.placeholders.pointsReward')}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.badgeName')}</label>
                <input
                  type="text"
                  value={formData.rewardBadge}
                  onChange={(e) => setFormData({ ...formData, rewardBadge: e.target.value })}
                  placeholder={t('events.create.placeholders.badgeName')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.badgeImage')}</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('events.create.badgeUpload')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('events.create.badgeHint')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION I - Media */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.media')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.coverImage')}</label>
                <label
                  htmlFor="coverUpload"
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('events.create.coverUpload')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('events.create.coverHint')}</p>

                  <input
                  id="coverUpload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCoverChange}
                  />
                </label>
                
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="mt-4 rounded-lg w-full h-48 object-cover"
                    />
                  )}

                
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.galleryImages')}</label>
                <label 
                htmlFor="galleryUpload" 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('events.create.galleryUpload')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('events.create.galleryHint')}</p>
                </label>

                <input
                  id="galleryUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleGalleryChange}
                />

                {/* Preview Grid */}
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt="Gallery Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SECTION J - Visibility & Rules */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.create.visibilityRules')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('common.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Draft">{t('events.create.statusOptions.draft')}</option>
                  <option value="Open">{t('events.create.statusOptions.open')}</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.create.featuredEvent')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCancellation}
                    onChange={(e) => setFormData({ ...formData, allowCancellation: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.create.allowCancellation')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION K - Save Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.create.saveActions')}</h3>

            <button
              onClick={() => handleSubmit('publish')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              {t('events.create.publish')}
            </button>

            <button
              onClick={() => handleSubmit('draft')}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              {t('events.create.saveAsDraft')}
            </button>

            <button
              onClick={() => navigate('/events')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}