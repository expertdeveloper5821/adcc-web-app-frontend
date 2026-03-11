import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, Clock, MapPin, Users, Settings, Award, Image as ImageIcon, Save, Plus, X, AlertTriangle, Archive, Ban, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent as updateEventApi, deleteEvent as deleteEventApi, EventApiResponse, availableCategories } from '../../services/eventsApi';
import { getAllTracks, deleteTrack } from '../../services/trackService';
import { getAllCommunities, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { formatToInputDate } from '../../utils/date';
import { useLocale } from '../../contexts/LocaleContext';
import { useTranslation } from 'react-i18next';

interface EventEditProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventEdit({ role }: EventEditProps) {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  // const eventId = id || '';
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const { locale } = useLocale();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [existingEvent, setExistingEvent] = useState<EventApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const data = await getEventById(id);
        console.log('result',data);
        setExistingEvent(data);
      } catch (error) {
        toast.error('Event not found');
        // navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);
  // console.log('EventID',existingEvent);

  // Community records 
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [communitiesList, tracksList] = await Promise.all([
          getAllCommunities(),
          getAllTracks(),
        ]);
        setCommunities(Array.isArray(communitiesList) ? communitiesList : []);
        setTracks(Array.isArray(tracksList) ? tracksList : []);
      } catch (error) {
        toast.error('Failed to load communities or tracks');
      }
    };

    fetchMetaData();
  }, []);


  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, maxBase64Size: number = 500 * 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
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

  const [formData, setFormData] = useState<{
    title: string;
    titleAr: string;
    slug: string;
    category: string;
    communityId: string;
    mainImage: string;
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
    minAge: number;
    eligibilityBike: string;
    eligibilityExperience: string;
    categories: string;
    rewardPoints: number;
    rewardBadge: string;
    status: 'Draft' | 'Open' | 'Full' | 'Completed' | 'Archived';
    isFeatured: boolean;
    allowCancellation: boolean;
    galleryImages: string[];
    address: string;
    youtubeLink: string;
    maxAge: number;
  }>({
    title: '',
    titleAr: '',
    slug: '',
    category: 'Community Ride',
    communityId: '',
    mainImage: '',
    description: '',
    descriptionAr: '',
    country: '',
    city: '',
    trackId: '',
    eventImage: '',
    eventDate: '',
    eventTime: '07:00',
    endTime: '08:00',
    distance: 25,
    difficulty: 'Medium',
    maxParticipants: 100,
    schedule: [],
    amenities: [],
    minAge: 18,
    eligibilityBike: 'Any',
    eligibilityExperience: 'Beginner',
    categories: '',
    rewardPoints: 50,
    rewardBadge: '',
    status: 'Draft',
    galleryImages: [],
    isFeatured: false,
    allowCancellation: false,
    address: '',
    youtubeLink: '',
    maxAge: 70,
  });

  useEffect(() => {
    if (existingEvent) {
      const ev = existingEvent as EventApiResponse & {
        category?: string;
        country?: string;
        city?: string;
        distance?: number;
        schedule?: { time: string; title: string }[];
        eligibility?: { bikeType: string; experienceLevel: string };
        communityId?: string | { _id?: string; id?: string };
        community?: { _id?: string; id?: string };
        trackId?: string | { _id?: string; id?: string };
        track?: { _id?: string; id?: string };
      };
      const resolveId = (value: string | { _id?: string; id?: string } | undefined): string => {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        return (value._id ?? value.id ?? '') as string;
      };
      const communityId = resolveId(ev.communityId ?? ev.community);
      const trackId = resolveId(ev.trackId ?? ev.track);
      const statusMap: Record<string, 'Draft' | 'Open' | 'Full' | 'Completed' | 'Archived'> = {
        'Draft': 'Draft', 'draft': 'Draft',
        'Open': 'Open', 'open': 'Open',
        'Full': 'Full', 'full': 'Full',
        'Completed': 'Completed', 'completed': 'Completed',
        'Archived': 'Archived', 'archived': 'Archived',
      };
      const status = statusMap[ev.status] ?? 'Archived';
      setFormData({
        title: ev.title,
        titleAr: (ev as any).titleAr || '',
        slug: ev.slug ?? '',
        category: ev.category ?? ev.categories ?? 'Community Ride',
        communityId,
        mainImage: ev.mainImage ?? '',
        description: ev.description,
        descriptionAr: (ev as any).descriptionAr || '',
        country: ev.country ?? '',
        city: ev.city ?? '',
        trackId,
        eventDate: formatToInputDate(ev.eventDate),
        eventTime: ev.eventTime ?? '',
        endTime: ev.endTime ?? '',
        distance: ev.distance ?? 25,
        difficulty: (ev.difficulty === 'Easy' || ev.difficulty === 'Medium' || ev.difficulty === 'Hard' ? ev.difficulty : 'Medium'),
        maxParticipants: ev.maxParticipants,
        schedule: (ev.schedule && ev.schedule.length > 0) ? ev.schedule : [{ time: '', title: '' }],
        amenities: Array.isArray(ev.amenities) ? (ev.amenities as string[]) : [],
        minAge: ev.minAge ?? 18,
        eligibilityBike: ev.eligibility?.bikeType ?? 'Any',
        eligibilityExperience: ev.eligibility?.experienceLevel ?? 'Beginner',
        categories: '',
        rewardPoints: ev.rewards?.points ?? 50,
        rewardBadge: ev.rewards?.badgeName ?? '',
        status,
        isFeatured: ev.isFeatured ?? false,
        allowCancellation: ev.allowCancellation ?? false,
        galleryImages: ev.galleryImages ?? [],
        address: ev.address ?? '',
        youtubeLink: ev.youtubeLink ?? '',
        maxAge: ev.maxAge ?? 70,
      });
    }
  }, [existingEvent]);


  // const tracks = allTracks.filter(track => track.city === formData.city);

  // Predefined amenities that appear as checkboxes
  const predefinedAmenities = ['water', 'toilets', 'parking', 'lighting', 'medical support', 'bike service'];

  // Custom amenities (those not in the predefined list)
  const customAmenities = formData.amenities.filter(a => !predefinedAmenities.includes(a));

  // Country → City → Track cascade (same as EventCreate)
  const AVAILABLE_COUNTRIES = ['UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman', 'Qatar'];
  const availableCountries = AVAILABLE_COUNTRIES;

  const availableCities = React.useMemo(() => {
    if (!formData.country) return [];
    const country = formData.country.trim();
    const cities = Array.from(
      new Set(
        tracks
          .filter((t: { country?: string }) => (t.country || 'UAE').trim() === country)
          .map((t: { city?: string }) => (t.city || '').trim())
          .filter(Boolean)
      )
    );
    return cities.sort();
  }, [tracks, formData.country]);

  const filteredTracks = React.useMemo(() => {
    if (!formData.country || !formData.city) return [];
    const country = formData.country.trim();
    const city = formData.city.trim();
    return tracks.filter(
      (t: { country?: string; city?: string }) =>
        (t.country || 'UAE').trim() === country && (t.city || '').trim() === city
    );
  }, [tracks, formData.country, formData.city]);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      title: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // Optional: limit max images (10)
    if (galleryImages.length + files.length > 10) {
      alert("Maximum 10 images allowed");
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
    if (updatedPreviews[index]) {
      try { URL.revokeObjectURL(updatedPreviews[index]); } catch (e) { /* ignore */ }
    }

    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setGalleryImages(updatedImages);
    setGalleryPreviews(updatedPreviews);
  };

  const handleCloseRegistration = async () => {
    if (!id) return;
    try {
      await updateEventApi(id, { status: 'Full' });
      setExistingEvent(prev => prev ? { ...prev, status: 'Full' } : prev);
      setFormData(prev => ({ ...prev, status: 'Full' }));
      toast.success('Registration closed');
    } catch {
      toast.error('Failed to close registration');
    }
  };

  const handleReopenRegistration = async () => {
    if (!id) return;
    try {
      await updateEventApi(id, { status: 'Open' });
      setExistingEvent(prev => prev ? { ...prev, status: 'Open' } : prev);
      setFormData(prev => ({ ...prev, status: 'Open' }));
      toast.success('Registration reopened');
    } catch {
      toast.error('Failed to reopen registration');
    }
  };

  const handleMarkCompleted = async () => {
    if (!id) return;
    try {
      await updateEventApi(id, { status: 'Completed' });
      setExistingEvent(prev => prev ? { ...prev, status: 'Completed' } : prev);
      setFormData(prev => ({ ...prev, status: 'Completed' }));
      toast.success('Event marked as completed');
    } catch {
      toast.error('Failed to mark event as completed');
    }
  };

  const handleDisable = async () => {
    if (!id) return;
    try {
      await updateEventApi(id, { status: 'Archived' });
      setExistingEvent(prev => prev ? { ...prev, status: 'Archived' } : prev);
      setFormData(prev => ({ ...prev, status: 'Archived' }));
      toast.success('Event disabled');
      setShowDisableModal(false);
    } catch {
      toast.error('Failed to disable event');
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      await deleteEventApi(id);
      toast.success('Event archived');
      setShowArchiveModal(false);
      navigate('/events');
    } catch {
      toast.error('Failed to archive event');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        mainImage: reader.result as string,
      }));
    };
  }

  const handleSave = async () => {
    if (!id) return;

    if (!formData.title || !formData.eventDate) {
      toast.error('Title and Event Date are required');
      return;
    }

    setIsSaving(true);

    try {

      let coverBase64 = '';
      let galleryBase64: string[] = [];

      // if (coverImage) {
      //   coverBase64 = await compressImage(coverImage);
      // }
      if (galleryImages.length > 0) {
        galleryBase64 = await Promise.all(galleryImages.map(img => compressImage(img)));
      }

      const payload = {
        title: formData.title,
        ...(formData.titleAr?.trim() ? { titleAr: formData.titleAr.trim() } : {}),
        slug: formData.slug,
        category: formData.category,
        communityId: formData.communityId,
        trackId: formData.trackId,
        mainImage: formData.mainImage,
        description: formData.description,
        ...(formData.descriptionAr?.trim() ? { descriptionAr: formData.descriptionAr.trim() } : {}),
        city: formData.city,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        endTime: formData.endTime,
        distance: formData.distance,
        difficulty: formData.difficulty,
        maxParticipants: formData.maxParticipants,
        schedule: formData.schedule.filter(
          (s) => s.time && s.title
        ),
        amenities: formData.amenities,
        minAge: formData.minAge,
        eligibility: {
          // ageRequirement: formData.eligibilityAge,
          bikeType: formData.eligibilityBike,
          experienceLevel: formData.eligibilityExperience,
        },
        galleryImages: galleryBase64,
        // rewards: {
        //   points: formData.rewardPoints,
        //   badgeName: formData.rewardBadge,
        // },
        status: formData.status,
        isFeatured: formData.isFeatured,
        allowCancellation: formData.allowCancellation,
        address: formData.address,
        country: formData.country,
        maxAge: formData.maxAge,
        youtubeLink: formData.youtubeLink || undefined,
      };

      await updateEventApi(id, payload);

      toast.success('Event updated successfully');
      navigate(`/events/${id}`);
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        'Failed to update event'
      );
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancel = () => {
    navigate(-1);
  };

  // console.log('formData',formData);

  if (isLoading) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Loading event...</div>;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to event detail"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Edit Event</h1>
          <p style={{ color: '#666' }}>{existingEvent?.title ?? formData.title}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>Event Information</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Abu Dhabi Night Race Series – Round 3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  style={{ color: '#999' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event description"
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="space-y-4" style={{ display: locale === 'ar' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  عنوان الحدث <span className="text-gray-400">(Event Title)</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  placeholder="سلسلة سباقات أبوظبي الليلية"
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
                  rows={5}
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
                    <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>English reference</span>
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{t(`data.eventCategories.${category}`, category)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community *</label>
                <select
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  
                  <option value="">Select community...</option>
                  {Array.isArray(communities) &&
                    communities.map((community) => (
                      <option key={(community as { _id?: string; id?: string })._id ?? (community as { _id?: string; id?: string }).id} value={(community as { _id?: string; id?: string })._id ?? (community as { _id?: string; id?: string }).id}>
                        {community.title}
                      </option>
                    ))
                  }

                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>YouTube Link</label>
                <input
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Time *</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('events.create.locationTrack')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm mb-2 whitespace-nowrap" style={{ color: '#666' }}>
                  <Globe className="w-4 h-4 shrink-0" />
                  {t('events.create.country')}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      country: e.target.value,
                      city: '',
                      trackId: '',
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">{t('events.create.placeholders.country')}</option>
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {t(`data.countries.${country}`, country)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm mb-2 whitespace-nowrap" style={{ color: '#666' }}>
                  <MapPin className="w-4 h-4 shrink-0" />
                  {t('events.create.city')}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      city: e.target.value,
                      trackId: '',
                    })
                  }
                  disabled={!formData.country}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">{t('events.create.placeholders.city')}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {t(`data.locations.${city}`, city)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.create.track')}</label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  disabled={!formData.city}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">{t('events.create.placeholders.track')}</option>
                  {filteredTracks.map((track) => (
                    <option key={track._id || track.id} value={track._id || track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
                {formData.country && formData.city && (
                  <>
                    {filteredTracks.length > 0 ? (
                      <p className="text-sm mt-1.5" style={{ color: '#059669' }}>
                        {t('events.create.tracksAvailable', { count: filteredTracks.length })}
                      </p>
                    ) : (
                      <p className="text-sm mt-1.5 text-amber-600">
                        {t('communities.form.noTracksInLocation', {
                          city: formData.city,
                          country: formData.country,
                        })}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION C - Date & Time */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>C. Date & Time</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Start Time *</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>End Time *</label>
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
              <h2 className="text-xl" style={{ color: '#333' }}>D. Ride Details</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Distance (km)</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })}
                    placeholder="25"
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Participants *</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Registration Fee</label>
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
              <h2 className="text-xl" style={{ color: '#333' }}>E. Event Schedule</h2>
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
                    placeholder="Activity title"
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
                Add schedule row
              </button>
            </div>
          </div>

          {/* SECTION F - Amenities */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>F. Amenities</h2>
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
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., Yas Marina Circuit, Abu Dhabi"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              />
            </div>
          </div>

          {/* SECTION G - Eligibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>G. Eligibility</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Age Requirement</label>
                <input
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 18 })}
                  placeholder="18+"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Bike Type</label>
                <input
                  type="text"
                  value={formData.eligibilityBike}
                  onChange={(e) => setFormData({ ...formData, eligibilityBike: e.target.value })}
                  placeholder="Road bike, Mountain bike, Any..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Experience Level</label>
                <select
                  value={formData.eligibilityExperience}
                  onChange={(e) => setFormData({ ...formData, eligibilityExperience: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
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
              <h2 className="text-xl" style={{ color: '#333' }}>H. Rewards & Badges</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Points Reward</label>
                {/* <input
                  type="number"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                /> */}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Badge Name</label>
                <input
                  type="text"
                  value={formData.rewardBadge}
                  onChange={(e) => setFormData({ ...formData, rewardBadge: e.target.value })}
                  placeholder="Night Racer Champion"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Badge Image</label>
                <div className="mb-3">
                  {/* {existingEvent.rewards.badgeImage && (
                    <img src={existingEvent.rewards.badgeImage} alt="Badge" className="w-20 h-20 rounded-lg" />
                  )} */}
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload new badge image</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, SVG - Square format</p>
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
              <h2 className="text-xl" style={{ color: '#333' }}>Media</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Cover Image
                </label>

                {/* Preview */}
                <div className="mb-3">
                  <img
                    src={formData.mainImage || existingEvent.mainImage}
                    alt="Cover"
                    className="w-full h-32 rounded-lg object-cover"
                  />
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  id="coverUpload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onloadend = () => {
                      setFormData((prev) => ({
                        ...prev,
                        mainImage: reader.result as string,
                      }));
                    };
                  }}
                />

                {/* Clickable Upload Box */}
                <div
                  onClick={() => document.getElementById('coverUpload')?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: '#999' }}
                  />
                  <p className="text-sm" style={{ color: '#666' }}>
                    Upload new cover image
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>
                    PNG, JPG - 16:9 format
                  </p>
                </div>


              </div>
            </div>

            <div className="space-y-4">
              <div>
                {/* <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Gallery Images (optional)
                </label> */}

                {/* Clickable Upload Box */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Gallery Images (optional)</label>
                  <label
                    htmlFor="galleryUpload"
                    className="border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors block"
                    style={{ borderColor: '#ECC180' }}
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImageIcon className="w-10 h-10 mb-3" style={{ color: '#999' }} />
                      <p className="text-lg font-medium" style={{ color: '#666' }}>Upload gallery images</p>
                      <p className="text-sm mt-1" style={{ color: '#999' }}>PNG, JPG - Multiple files accepted</p>
                    </div>
                    <input
                      id="galleryUpload"
                      type="file"
                      accept="image/png, image/jpeg"
                      multiple
                      hidden
                      onChange={handleGalleryChange}
                    />
                  </label>

                  {/* Preview Grid - New Uploads */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="col-span-full mb-2">
                          <p className="text-sm font-semibold" style={{ color: '#333' }}>New Images:</p>
                        </div>
                      {galleryPreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
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

                  {/* Preview Grid - Existing Images */}
                  {existingEvent?.galleryImages && existingEvent.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="col-span-full mb-2">
                        <p className="text-sm font-semibold" style={{ color: '#333' }}>Existing Images:</p>
                      </div>
                      {existingEvent.galleryImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={image}
                            alt="Gallery"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>  

        

          </div>

          {/* Event Controls */}
          <div className="p-6 rounded-2xl shadow-sm bg-white border-2" style={{ borderColor: '#FEE2E2' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#C12D32' }} />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Event Controls</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCloseRegistration}
                disabled={existingEvent.status !== 'Open'}
                className="cursor-pointer px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F59E0B', color: '#fff' }}
              >
                Close Registration
              </button>

              <button
                onClick={handleReopenRegistration}
                disabled={existingEvent.status === 'Open'}
                className="cursor-pointer px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#10B981', color: '#fff' }}
              >
                Re-open Registration
              </button>

              <button
                onClick={handleMarkCompleted}
                disabled={existingEvent.status === 'Completed'}
                className="cursor-pointer px-4 py-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3B82F6', color: '#fff' }}
              >
                Mark as Completed
              </button>

              <button
                onClick={() => setShowDisableModal(true)}
                className="cursor-pointer px-4 py-2 rounded-lg transition-all hover:shadow-md"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                Disable Event
              </button>
            </div>

            <button
              onClick={() => setShowArchiveModal(true)}
              className="cursor-pointer w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: '#C12D32', color: '#C12D32' }}
            >
              <Archive className="w-4 h-4" />
              Archive Event
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Registration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 500 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Min Age</label>
                <input
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 16 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Age</label>
                <input
                  type="number"
                  value={formData.maxAge}
                  onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>
            </div>
          </div>

          {/* Visibility & Rules */}
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
                  <option value="Full">{t('events.create.statusOptions.full')}</option>
                  <option value="Completed">{t('events.create.statusOptions.completed')}</option>
                  <option value="Archived">{t('events.create.statusOptions.archived')}</option>
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

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={() => navigate(`/events/${id}`)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
