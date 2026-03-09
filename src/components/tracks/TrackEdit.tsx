import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, Shield, Image as ImageIcon, Settings, Save, Archive, AlertTriangle, Globe } from 'lucide-react';
import { getAllEvents } from '../../data/eventsData';
import { getAllCommunities } from '../../data/communitiesData';
import { toast } from 'sonner@2.0.3';
import { UserRole } from '../../App';
import { getTrackById, getTrackResults, trackCommunityResults, updateTrack, deleteTrack, disableTrack, enableTrack } from '../../services/trackService';
import { FacilityType } from '@/types/track.types';
import { TRACK_FACILITIES } from '@/constants/track.constants';
import { useLocale } from '../../contexts/LocaleContext';
import { useTranslation } from 'react-i18next';

interface TrackEditProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function TrackEdit({ role }: TrackEditProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const trackId = id;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { locale } = useLocale();
  const [ track, setTrack ] = useState<Track | null >(null);

  const [linkedEvents, setLinkedEvents] = useState<any[]>([]);
  const [linkedCommunities, setLinkedCommunities] = useState<any[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Load track data on component mount
  useEffect(() => {
  if (!trackId) return;

  const fetchTrack = async () => {
    try {
      const data = await getTrackById(trackId);
      setTrack(data);
    } catch (error) {
      toast.error(t('tracks.edit.toasts.notFound'));
    } finally {
      setIsLoading(false);
    }
  };

  fetchTrack();
}, [trackId]);


  useEffect(() => {
      if(!trackId) return;
  
      const fetchEvent = async () => {
        try{
          const data = await getTrackResults(trackId);
          setLinkedEvents(data || [])
        }catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvent();
    },[trackId])

    useEffect(() => {
  if (!trackId) return;

  const fetchCommunities = async () => {
    try {
      const data = await trackCommunityResults(trackId);
      setLinkedCommunities(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  fetchCommunities();
}, [trackId]);


useEffect(() => {
  if (track) {
    // fill inputs and previews
    setCoverPreview(track.coverImage || null);
    setGalleryPreviews(track.galleryImages || []);

    setFormData(prev => ({
      ...prev,
      thumbnailImage: track.image || prev.thumbnailImage,
      coverImage: track.coverImage || prev.coverImage,
      galleryImages: track.galleryImages || prev.galleryImages,
    }));
  }
}, [track]);


const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setCoverImage(file);
  setCoverPreview(URL.createObjectURL(file));

  // convert to base64 and store in formData
  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
  };
  reader.readAsDataURL(file);
};

const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    const files: File[] = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    if (galleryImages.length + files.length > 10) {
      toast.error(t('tracks.edit.toasts.maxImages'));
      e.target.value = '';
      return;
    }

    const newPreviews = files.map((file: File) => URL.createObjectURL(file));
    const base64Results = await Promise.all(
      files.map(
        (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    setGalleryImages((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...base64Results],
    }));
    e.target.value = '';
  };


  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryPreviews[index]);
    const updatedImages = galleryImages.filter((_, i) => i !== index);
    const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryImages(updatedImages);
    setGalleryPreviews(updatedPreviews);
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    trackType: 'road' as 'road' | 'circuit' | 'coastal' | 'desert' | 'urban',
    country: 'UAE',
    city: 'Abu Dhabi',
    area: '',
    distance: 10,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    surfaceType: 'asphalt' as 'asphalt' | 'concrete' | 'mixed',
    elevation: '',
    estimatedTime: '',
    loopOptions: [] as number[],
    loopOptionInput: '',
    facilities: [] as string[],
    safetyNotes: '',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'open' as 'open' | 'limited' | 'closed',
    visibility: 'Public' as 'Public' | 'Hidden',
    displayPriority: 5,
    thumbnailImage: '',
    coverImage: '',
    galleryImages: [] as string[],
  });

  useEffect(() => {
  if (!track) return;
  setFormData(prev => ({
    ...prev,
    title: track.title || prev.title,
    titleAr: (track as any).titleAr || prev.titleAr,
    slug: (track as any).slug || prev.slug,
    description: track.description || prev.description,
    descriptionAr: (track as any).descriptionAr || prev.descriptionAr,
    city: track.city || prev.city,
    area: track.area || prev.area,
    distance: track.distance ?? prev.distance,
    elevation: String((track as any).elevation ?? prev.elevation),
    difficulty: track.difficulty || prev.difficulty,
    surfaceType: track.surfaceType || prev.surfaceType,
    helmetRequired: track.helmetRequired ?? prev.helmetRequired,
    nightRidingAllowed: track.nightRidingAllowed ?? prev.nightRidingAllowed,
    safetyNotes: track.safetyNotes || prev.safetyNotes,
    shortDescription: (track as any).shortDescription || prev.shortDescription,
    status: track.status || prev.status,
    image: track.image || prev.image,
    mapPreview: track.mapPreview || prev.mapPreview,
    facilities: track.facilities || prev.facilities,
    estimatedTime: track.estimatedTime || prev.estimatedTime,
    // If backend returns loopOptions as CSV string, parse it into numbers
    loopOptions: (track as any).loopOptions
      ? typeof (track as any).loopOptions === 'string'
        ? (track as any).loopOptions.split(',').map((n: string) => parseFloat(n)).filter((x: number) => !isNaN(x))
        : (track as any).loopOptions
      : prev.loopOptions,
  }));
}, [track]);


  if (!track) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p style={{ color: '#666' }}>{t('tracks.edit.trackNotFound')}</p>
      </div>
    );
  }

  

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      title: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const toggleFacility = (facility: FacilityType) => {
  setFormData(prev => ({
    ...prev,
    facilities: prev.facilities.includes(facility)
      ? prev.facilities.filter(f => f !== facility)
      : [...prev.facilities, facility],
  }));
};


  const addLoopOption = () => {
    const value = parseFloat((formData.loopOptionInput as any) || '');
    if (!isNaN(value) && value > 0 && !formData.loopOptions.includes(value)) {
      setFormData(prev => ({
        ...prev,
        loopOptions: [...prev.loopOptions, value].sort((a, b) => a - b),
        loopOptionInput: '',
      }));
    }
  };

  const removeLoopOption = (value: number) => {
    setFormData(prev => ({
      ...prev,
      loopOptions: prev.loopOptions.filter(o => o !== value),
    }));
  };

  


const handleImageUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  field: 'thumbnailImage' | 'coverImage'
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Optional: limit size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error(t('tracks.edit.toasts.imageTooLarge'));
    return;
  }

  const reader = new FileReader();

  reader.onload  = () => {
    setFormData(prev => ({
      ...prev,
      [field]: reader.result as string,
    }));
  };

  reader.readAsDataURL(file);
};

const handleGalleryUpload = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const files = event.target.files;
  if (!files) return;

  const fileArray = Array.from(files) as File[];

  fileArray.forEach((file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error(`${file.name} is larger than 2MB`);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        galleryImages: [
          ...prev.galleryImages,
          reader.result as string,
        ],
      }));
    };

    reader.readAsDataURL(file);
  });
  event.target.value = ''
};

// const removeGalleryImage = (index: number) => {
//   setFormData(prev => ({
//     ...prev,
//     galleryImages: prev.galleryImages.filter((_, i) => i !== index),
//   }));
// };


  const handleSubmit = async () => {
    if (!trackId) return;

    if (!formData.title || !formData.city) {
      toast.error(t('tracks.edit.toasts.requiredFields'));
      return;
    }

    if (formData.distance <= 0) {
      toast.error(t('tracks.edit.toasts.invalidDistance'));
      return;
    }

    try {
      // Build cleaned payload to match backend: trackType 'coastal' -> 'costal', galleryImages always array
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        ...(formData.titleAr?.trim() ? { titleAr: formData.titleAr.trim() } : {}),
        ...(formData.descriptionAr?.trim() ? { descriptionAr: formData.descriptionAr.trim() } : {}),
        trackType: formData.trackType === 'coastal' ? 'costal' : formData.trackType,
        country: formData.country,
        city: formData.city,
        area: formData.area,
        distance: Number(formData.distance),
        difficulty: formData.difficulty,
        surfaceType: formData.surfaceType,
        elevation: String(formData.elevation ?? ''),
        estimatedTime: formData.estimatedTime || undefined,
        loopOptions: (formData.loopOptions || []).length ? formData.loopOptions : undefined,
        facilities: formData.facilities,
        safetyNotes: formData.safetyNotes,
        helmetRequired: Boolean(formData.helmetRequired),
        nightRidingAllowed: Boolean(formData.nightRidingAllowed),
        status: formData.status,
        image: formData.thumbnailImage,
        coverImage: formData.coverImage,
        galleryImages: Array.isArray(formData.galleryImages) ? formData.galleryImages : [],
        visibility: formData.visibility,
        displayPriority: Number(formData.displayPriority) || 0,
      };

      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await updateTrack(trackId, payload);

      toast.success(t('tracks.edit.toasts.updateSuccess'));
      navigate(`/tracks/${trackId}/edit`);
    } catch (error: any) {
      console.error('Update error:', error?.response?.data || error);
      toast.error(t('tracks.edit.toasts.updateError'));
    }
  };


  const handleDelete = async () => {
  if (!trackId) return;

  try {
    await deleteTrack(trackId);
    toast.success(t('tracks.edit.toasts.deleteSuccess'));
    navigate('/tracks');
  } catch (error) {
    toast.error(t('tracks.edit.toasts.deleteError'));
  }
};

const handleDisable = async (id: string, name: string) => {
  if (!window.confirm(`Disable "${name}"?`)) return;

  try {
    await disableTrack(id);
    toast.success(t('tracks.edit.toasts.disabled'));
    setTrack();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || t('tracks.edit.toasts.disableError'));
  }
};


  const cities = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/tracks/${trackId}`) }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('tracks.edit.title')}</h1>
            <p style={{ color: '#666' }}>{t('tracks.edit.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Read-only Stats Panel */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.edit.statistics')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.edit.totalEvents')}</p>
                <p className="text-2xl" style={{ color: '#333' }}>{linkedEvents.length}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.edit.upcomingEvents')}</p>
                <p className="text-2xl" style={{ color: '#10B981' }}>
                  {linkedEvents.filter((e: any) => new Date(e.eventDate) >= new Date()).length}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.edit.communities')}</p>
                <p className="text-2xl" style={{ color: '#333' }}>{linkedCommunities.length}</p>
              </div>
            </div>
          </div>

          {/* SECTION 1 - Basic Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.basicInfo')}</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.trackName')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('tracks.edit.placeholders.trackName')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.slug')}</label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  style={{ color: '#999' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('tracks.edit.placeholders.description')}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="space-y-4" style={{ display: locale === 'ar' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  اسم المسار <span className="text-gray-400">(Track Name)</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  placeholder="حلبة مرسى ياس"
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
                  placeholder="وصف المسار..."
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.trackType')}</label>
                <select
                  value={formData.trackType}
                  onChange={(e) => setFormData({ ...formData, trackType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="road">{t('tracks.edit.trackTypeOptions.road')}</option>
                  <option value="circuit">{t('tracks.edit.trackTypeOptions.circuit')}</option>
                  <option value="coastal">{t('tracks.edit.trackTypeOptions.coastal')}</option>
                  <option value="desert">{t('tracks.edit.trackTypeOptions.desert')}</option>
                  <option value="urban">{t('tracks.edit.trackTypeOptions.urban')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.country')}</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="UAE">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Oman">Oman</option>
                  <option value="Qatar">Qatar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.city')}</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.area')}</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder={t('tracks.edit.placeholders.area')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 - Route Details */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.routeDetails')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.distance')}</label>
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 0 })}
                  placeholder={t('tracks.edit.placeholders.distance')}
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.difficulty')}</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="easy">{t('tracks.edit.difficultyOptions.easy')}</option>
                  <option value="medium">{t('tracks.edit.difficultyOptions.medium')}</option>
                  <option value="hard">{t('tracks.edit.difficultyOptions.hard')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.surfaceType')}</label>
                <select
                  value={formData.surfaceType}
                  onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Asphalt">{t('tracks.edit.surfaceOptions.asphalt')}</option>
                  <option value="Concrete">{t('tracks.edit.surfaceOptions.concrete')}</option>
                  <option value="Mixed">{t('tracks.edit.surfaceOptions.mixed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.elevationGain')}</label>
                <input
                  type="text"
                  value={formData.elevation}
                  onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                  placeholder={t('tracks.edit.placeholders.elevation')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.estimatedRideTime')}</label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder={t('tracks.edit.placeholders.estimatedRideTime')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.loopOptions')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={formData.loopOptionInput}
                    onChange={(e) => setFormData({ ...formData, loopOptionInput: e.target.value })}
                    placeholder={t('tracks.edit.placeholders.loopOptions')}
                    min="0.1"
                    step="0.1"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                    onKeyPress={(e) => e.key === 'Enter' && addLoopOption()}
                  />
                  <button
                    type="button"
                    onClick={addLoopOption}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#C12D32' }}
                  >
                    {t('common.create')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.loopOptions?.map(opt => (
                    <span
                      key={opt}
                      className="px-3 py-1 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      {opt} km
                      <button
                        type="button"
                        onClick={() => removeLoopOption(opt)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 - Facilities */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.facilities')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {TRACK_FACILITIES.map((facility) => {
                const isChecked = formData.facilities.includes(facility.value);

                return (
                  <label
                    key={facility.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition
                      ${isChecked ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFacility(facility.value)}
                      className="w-5 h-5 accent-red-600"
                    />
                    <span className="font-medium">{facility.label}</span>
                  </label>
                );
              })}
            </div>

          </div>

          {/* SECTION 4 - Safety Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.safetyInfo')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.safetyNotes')}</label>
                <textarea
                  value={formData.safetyNotes}
                  onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                  placeholder={t('tracks.edit.placeholders.safetyNotes')}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.helmetRequired}
                    onChange={(e) => setFormData({ ...formData, helmetRequired: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('tracks.edit.helmetRequired')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nightRidingAllowed}
                    onChange={(e) => setFormData({ ...formData, nightRidingAllowed: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('tracks.edit.nightRiding')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5 - Media */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.media')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('tracks.edit.currentThumbnail')}
                </label>

                <img
                  src={formData.thumbnailImage || track.image}
                  alt="Thumbnail"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />

                <label
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <p className="text-sm" style={{ color: '#666' }}>
                    {t('tracks.edit.replaceThumbnail')}
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e, 'thumbnailImage')}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.currentCover')}</label>
                <label
                  htmlFor="coverUpload"
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('tracks.edit.uploadCover')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('tracks.edit.coverHint')}</p>

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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.galleryImages')}</label>
                <label
                  htmlFor="galleryUpload"
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('tracks.edit.uploadGallery')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('tracks.edit.galleryHint')}</p>
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
          {/* SECTION 6 - Status & Visibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.edit.statusVisibility')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.trackStatus')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="open">{t('tracks.edit.statusOptions.open')}</option>
                  <option value="limited">{t('tracks.edit.statusOptions.limited')}</option>
                  <option value="closed">{t('tracks.edit.statusOptions.closed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.visibility')}</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Public">{t('tracks.edit.visibilityOptions.public')}</option>
                  <option value="Hidden">{t('tracks.edit.visibilityOptions.hidden')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('tracks.edit.displayPriority')}</label>
                <input
                  type="number"
                  value={formData.displayPriority}
                  onChange={(e) => setFormData({ ...formData, displayPriority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-xs mt-1" style={{ color: '#999' }}>{t('tracks.edit.priorityHint')}</p>
              </div>
            </div>
          </div>

          {/* SECTION 7 - Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.edit.actions')}</h3>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              {t('tracks.edit.saveChanges')}
            </button>

            <button
              onClick={() => navigate('track-detail', { selectedTrackId: trackId })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              {t('common.cancel')}
            </button>
          </div>

          {/* Advanced Controls */}
          <div className="p-6 rounded-2xl shadow-sm bg-white border-2" style={{ borderColor: '#FEE2E2' }}>
            <h3 className="text-lg mb-3" style={{ color: '#333' }}>{t('tracks.edit.advancedControls')}</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  const isClosed = track.status === 'closed';

                  updateTrack(trackId as string, {
                    status: isClosed ? 'open' : 'closed',
                  });

                  toast.success(isClosed ? t('tracks.edit.toasts.enabled') : t('tracks.edit.toasts.disabled'));
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {track.status === 'closed' ? t('tracks.edit.enableTrack') : t('tracks.edit.disableTrack')}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#EF4444' }}
                disabled={linkedEvents.length > 0}
              >
                {linkedEvents.length > 0 ? t('tracks.edit.cannotDelete') : t('tracks.edit.deleteTrack')}
              </button>

              {linkedEvents.length > 0 && (
                <p className="text-xs" style={{ color: '#EF4444' }}>
                  {t('tracks.edit.linkedEvents', { count: linkedEvents.length })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
              <h3 className="text-xl" style={{ color: '#333' }}>{t('tracks.edit.deleteModal.title')}</h3>
            </div>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('tracks.edit.deleteModal.body', { name: track.title })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#EF4444' }}
              >
                {t('tracks.edit.deleteModal.confirm')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('tracks.edit.deleteModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}