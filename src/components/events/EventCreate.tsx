import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Settings, Award, Image as ImageIcon, Save, Plus, X, Globe } from 'lucide-react';
import { addEvent, Event, availableCategories } from '../../data/eventsData';
import { getTracksByCountryAndCity } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';
import { getAllTracks, deleteTrack } from '../../services/trackService';
import { createEvent, EventApiResponse } from '../../services/eventsApi';
import { getAllCommunities, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { Input } from '../ui/input';
import { UserRole } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '../../contexts/LocaleContext';

interface EventCreateProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventCreate({ role }: EventCreateProps) {
  
  const navigate = useNavigate();
  
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

  // Community and track records – APIs return arrays directly
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [communityList, trackList] = await Promise.all([
          getAllCommunities(),
          getAllTracks(),
        ]);

        setCommunities(Array.isArray(communityList) ? communityList : []);
        setTracks(Array.isArray(trackList) ? trackList : []);
      } catch (error) {
        toast.error('Failed to load communities or tracks');
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.description.trim()) errors.description = 'Event description is required';
    if (!formData.eventDate) errors.eventDate = 'Invalid event date';
    return errors;
  };

  const handleSubmit = async (action: 'draft' | 'publish') => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill all required fields');
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
        schedule: Array.isArray(formData.schedule) ? formData.schedule : [],
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        mainImage: coverBase64 || undefined,
        galleryImages: galleryBase64,
        status: action === 'draft' ? 'Draft' : 'Open',
        isFeatured: !!formData.isFeatured,
        allowCancellation: !!formData.allowCancellation,
      };

      await createEvent(payload);
      toast.success('Event created successfully');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to create event');
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
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Event</h1>
          <p style={{ color: '#666' }}>Create a new cycling event or race</p>
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
                <h2 className="text-xl" style={{ color: '#333' }}>A. Basic Information</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Abu Dhabi Night Race Series – Round 3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {formErrors.title && <div className="text-xs text-red-600 mt-1">{formErrors.title}</div>}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Slug (auto-generated)</label>
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
                  placeholder="Describe the event..."
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
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community * (mandatory)</label>
                <select
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Select community...</option>
                  {communities?.map(community => (
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
              <h2 className="text-xl" style={{ color: '#333' }}>B. Location & Track</h2>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Track *</label>
              <select
                value={formData.trackId}
                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Select track...</option>
                {tracks?.map(track => (
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
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                placeholder="Add custom amenity"
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
                Add
              </button>
            </div>

            {customAmenities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold" style={{ color: '#333' }}>Custom Amenities:</h3>
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
              <h2 className="text-xl" style={{ color: '#333' }}>G. Eligibility</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Age Requirement</label>
                <input
                  type="text"
                  value={formData.eligibilityAge}
                  onChange={(e) => setFormData({ ...formData, eligibilityAge: Number(e.target.value) })}
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
                <input
                  type="number"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: Number(e.target.value) || 0 })}
                  placeholder="50"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
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
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload badge image</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, SVG - Square format recommended</p>
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
              <h2 className="text-xl" style={{ color: '#333' }}>I. Media</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image</label>
                <label
                  htmlFor="coverUpload"
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload cover image</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 16:9 format recommended</p>

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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Gallery Images (optional)</label>
                <label 
                htmlFor="galleryUpload" 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload gallery images</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>Multiple images supported</p>
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
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>J. Visibility & Rules</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Draft">Draft</option>
                  <option value="Open">Open</option>
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
                  <span className="text-sm" style={{ color: '#666' }}>Featured Event</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCancellation}
                    onChange={(e) => setFormData({ ...formData, allowCancellation: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Allow Cancellation</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION K - Save Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>K. Save Actions</h3>

            <button
              onClick={() => handleSubmit('publish')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              Publish Event
            </button>

            <button
              onClick={() => handleSubmit('draft')}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Save as Draft
            </button>

            <button
              onClick={() => navigate('/events')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}