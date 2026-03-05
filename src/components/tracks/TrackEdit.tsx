import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Activity, Shield, Image as ImageIcon, Settings, Save, Archive, AlertTriangle } from 'lucide-react';
import { getAllEvents } from '../../data/eventsData';
import { getAllCommunities } from '../../data/communitiesData';
import { toast } from 'sonner@2.0.3';
import { UserRole } from '../../App';
import { getTrackById, getTrackResults, trackCommunityResults, updateTrack, deleteTrack, disableTrack, enableTrack } from '../../services/trackService';
import { FacilityType } from '@/types/track.types';
import { TRACK_FACILITIES } from '@/constants/track.constants';// import { getTrack, updateTrack, Track, availableFacilities, getTrackCommunities, deleteTrack } from '../../data/tracksData';

interface TrackEditProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function TrackEdit({ role }: TrackEditProps) {
  const navigate = useNavigate();
  
  const { id } = useParams<{ id: string }>();
  const trackId = id;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      toast.error('Track not found');
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

    // convert each file to base64 and add to formData
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });

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

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
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
    slug: (track as any).slug || prev.slug,
    description: track.description || prev.description,
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
        <p style={{ color: '#666' }}>Track not found</p>
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
    toast.error('Image must be less than 2MB');
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

  const fileArray = Array.from(files);

  fileArray.forEach(file => {
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
      toast.error('Please fill in required fields');
      return;
    }

    if (formData.distance <= 0) {
      toast.error('Distance must be greater than 0');
      return;
    }

    try {
      // Build cleaned payload to match backend: trackType 'coastal' -> 'costal', galleryImages always array
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
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

      toast.success('Track updated successfully');
      navigate(`/tracks/${trackId}/edit`);
    } catch (error: any) {
      console.error('Update error:', error?.response?.data || error);
      toast.error('Failed to update track');
    }
  };


  const handleDelete = async () => {
  if (!trackId) return;

  try {
    await deleteTrack(trackId);
    toast.success('Track deleted successfully');
    navigate('/tracks');
  } catch (error) {
    toast.error('Failed to delete track');
  }
};

const handleDisable = async (id: string, name: string) => {
  if (!window.confirm(`Disable "${name}"?`)) return;

  try {
    await disableTrack(id);
    toast.success('Track disabled successfully');
    setTrack();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to disable');
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
            <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Edit Track</h1>
            <p style={{ color: '#666' }}>Update track information and settings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Read-only Stats Panel */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Track Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Events</p>
                <p className="text-2xl" style={{ color: '#333' }}>{linkedEvents.length}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Upcoming Events</p>
                <p className="text-2xl" style={{ color: '#10B981' }}>
                  {linkedEvents.filter((e: any) => new Date(e.eventDate) >= new Date()).length}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Communities</p>
                <p className="text-2xl" style={{ color: '#333' }}>{linkedCommunities.length}</p>
              </div>
            </div>
          </div>

          {/* SECTION 1 - Basic Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>1. Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Yas Marina Circuit"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
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
                  placeholder="Describe the track, its features, and what makes it unique..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track Type *</label>
                <select
                  value={formData.trackType}
                  onChange={(e) => setFormData({ ...formData, trackType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="road">Road</option>
                  <option value="circuit">Circuit</option>
                  <option value="coastal">Coastal</option>
                  <option value="desert">Desert</option>
                  <option value="urban">Urban</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Country *</label>
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>City *</label>
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Area (optional)</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Yas Island, Marina, Corniche..."
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
              <h2 className="text-xl" style={{ color: '#333' }}>2. Route Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Total Distance (km) *</label>
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 0 })}
                  placeholder="42"
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Surface Type *</label>
                <select
                  value={formData.surfaceType}
                  onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Asphalt">Asphalt</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Elevation Gain (m)</label>
                <input
                  type="text"
                  value={formData.elevation}
                  onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                  placeholder="120"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Estimated Ride Time</label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="e.g., 2-3 hours"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Loop Options (km)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={formData.loopOptionInput}
                    onChange={(e) => setFormData({ ...formData, loopOptionInput: e.target.value })}
                    placeholder="e.g., 8, 15, 22, 35"
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
                    Add
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
              <h2 className="text-xl" style={{ color: '#333' }}>3. Facilities</h2>
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
              <h2 className="text-xl" style={{ color: '#333' }}>4. Safety Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Safety Notes</label>
                <textarea
                  value={formData.safetyNotes}
                  onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                  placeholder="Important safety information for riders..."
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
                  <span className="text-sm" style={{ color: '#666' }}>Helmet Required</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nightRidingAllowed}
                    onChange={(e) => setFormData({ ...formData, nightRidingAllowed: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Night Riding Allowed</span>
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
              <h2 className="text-xl" style={{ color: '#333' }}>5. Media</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Current Thumbnail
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
                    Click to replace thumbnail
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Current Cover Image</label>
                <label
                  htmlFor="coverUpload"
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload cover image (1200x600)</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 2:1 format recommended</p>

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
          {/* SECTION 6 - Status & Visibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>6. Status & Visibility</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Public">Public</option>
                  <option value="Hidden">Hidden (admin only)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Display Priority</label>
                <input
                  type="number"
                  value={formData.displayPriority}
                  onChange={(e) => setFormData({ ...formData, displayPriority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-xs mt-1" style={{ color: '#999' }}>Higher numbers appear first</p>
              </div>
            </div>
          </div>

          {/* SECTION 7 - Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>7. Actions</h3>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>

            <button
              onClick={() => navigate('track-detail', { selectedTrackId: trackId })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>

          {/* Advanced Controls */}
          <div className="p-6 rounded-2xl shadow-sm bg-white border-2" style={{ borderColor: '#FEE2E2' }}>
            <h3 className="text-lg mb-3" style={{ color: '#333' }}>Advanced Controls</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  const isClosed = track.status === 'closed';

                  updateTrack(trackId as string, {
                    status: isClosed ? 'open' : 'closed',
                  });

                  toast.success(isClosed ? 'Track enabled' : 'Track disabled');
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {track.status === 'closed' ? 'Enable Track' : 'Disable Track'}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#EF4444' }}
                disabled={linkedEvents.length > 0}
              >
                {linkedEvents.length > 0 ? 'Cannot Delete (Has Events)' : 'Delete Track'}
              </button>

              {linkedEvents.length > 0 && (
                <p className="text-xs" style={{ color: '#EF4444' }}>
                  This track has {linkedEvents.length} linked event(s).
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
              <h3 className="text-xl" style={{ color: '#333' }}>Delete Track?</h3>
            </div>
            <p className="mb-6" style={{ color: '#666' }}>
              This will permanently delete "{track.title}". This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#EF4444' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}