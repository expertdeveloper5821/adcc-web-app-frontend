import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Upload, Users, MapPin, Tag, Settings, Shield, Image as ImageIcon, Save, AlertTriangle, Archive, Trash2 } from 'lucide-react';
import { deleteCommunity } from '../../data/communitiesData';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { getCommunityById, updateCommunity, CommunityApiResponse, getAvailableCities, getAvailableCategories, COMMUNITY_LOCATION_OPTIONS } from '../../services/communitiesApi';
import { getAllTracks, deleteTrack } from '../../services/trackService';
import { CommunityFormData } from '../../types/community';
import { availableCategories } from '../../data/communitiesData'


interface CommunityEditProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function CommunityEdit({ role }: CommunityEditProps) {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [existingCommunity, setExistingCommunity] = useState<CommunityApiResponse | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  // const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // const [formData, setFormData] = useState<string[]>([]);

  // get community result
  useEffect(() => {
    if (!id) return;

    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const response = await getCommunityById(id);

        setExistingCommunity(response);
      } catch (error) {
        toast.error('Community not found');
        // navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunity();
  }, [id]);

  // Load all tracks from API (getAllTracks returns Track[] directly)
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const list = await getAllTracks();
        setTracks(Array.isArray(list) ? list : []);
      } catch (error) {
        toast.error('Failed to load tracks');
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, []);


  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsMetadataLoading(true);
        const [cities] = await Promise.all([
          getAvailableCities(),
        ]);
        setAvailableCities(cities);
      } catch (error) {
        console.error('Error loading metadata:', error);
      } finally {
        setIsMetadataLoading(false);
      }
    };
    fetchMetadata();
  }, []);




  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    city: '',
    communityType: 'city',
    category: '',
    type: [] as string[],
    country: '',
    area: '',
    primaryTrack: null,
    foundedYear: '',
    // ridesThisMonth: null,
    // weeklyRides: null,
    // fundsRaised: null,
    status: 'active',
    visibility: 'public',
    // joinMode: 'open',
    // isFeatured: false,
    // allowPosts: true,
    // allowGallery: true,
    // displayPriority: 0,
    manager: '',
  });


  const filteredTracks = useMemo(() => {


    if (!Array.isArray(tracks)) return [];
    if (!formData?.city) return tracks;

    return tracks.filter(track => {
      return (
        track.city?.toLowerCase().trim() ===
        formData.city?.toLowerCase().trim()
      );
    });
  }, [tracks, formData?.city]);


  useEffect(() => {
    if (!existingCommunity) return;

    setFormData({
      title: existingCommunity.title ?? (existingCommunity as any).name ?? '',
      slug: (existingCommunity as any).slug ?? '',
      description: existingCommunity.description ?? '',
      city: (existingCommunity as any).city ?? existingCommunity.location ?? '',
      category: existingCommunity.category,
      type: Array.isArray(existingCommunity.type)
        ? existingCommunity.type
          : [],
      // specialType: existingCommunity.specialType || null,
      country: existingCommunity.country,
      area: existingCommunity.area || '',
      primaryTrack: existingCommunity.primaryTracks ? existingCommunity.primaryTracks[0] : null,
      foundedYear: existingCommunity.foundedYear,
      // ridesThisMonth: existingCommunity.stats?.ridesThisMonth || null,
      // weeklyRides: existingCommunity.stats?.weeklyRides || null,
      // fundsRaised: existingCommunity.stats?.fundsRaised || null,
      status: existingCommunity.status,
      visibility: existingCommunity.visibility,
      // joinMode: 'open', // Default value - extend data model if needed
      isFeatured: existingCommunity.isFeatured,
      logo: existingCommunity.logo,
      image: existingCommunity.image,
      // allowPosts: existingCommunity.allowPosts,
      // allowGallery: existingCommunity.allowGallery,
      // displayPriority: 0, // Default value - extend data model if needed
      // tags: [],
      manager: existingCommunity.manager || '',
    });
  }, [existingCommunity]);

  if (isLoading || isMetadataLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (!existingCommunity) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p style={{ color: '#666' }}>Community not found</p>
      </div>
    );
  }

  const mapCommunityToForm = (data: CommunityFormData) => ({
    title: data.title ?? '',
    slug: data.slug ?? '',
    description: data.description ?? '',
    city: data.city ?? '',
    communityType: data.communityType ?? 'city',
    type: data.type ?? [],
    // specialType: data.specialType ?? null,
    country: data.country ?? '',
    area: data.area ?? '',
    primaryTracks: data.primaryTrackIds ?? [],
    foundedYear: data.foundedYear,
    // ridesThisMonth: data.stats?.ridesThisMonth ?? null,
    // weeklyRides: data.stats?.weeklyRides ?? null,
    // fundsRaised: data.stats?.fundsRaised ?? null,
    status: data.status ?? 'active',
    visibility: data.visibility ?? 'public',
    // joinMode: data.joinMode ?? 'open',
    // isFeatured: data.isFeatured ?? false,
    // allowPosts: data.allowPosts ?? true,
    // allowGallery: data.allowGallery ?? true,
    // displayPriority: data.displayPriority ?? 0,
    // tags: data.tags ?? [],
    manager: data.manager ?? '',
  });


  const handleNameChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const toggleCategory = (value: string) => {
    setFormData((prev) => {
      const current = prev.type || [];

      const exists = current.includes(value);

      return {
        ...prev,
        type: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };


  const toggleTrack = (trackId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryTrack: prev.primaryTrack === trackId ? null : trackId,
    }));
  };

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo: reader.result as string,
      }));
    };
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result as string,
      }));
    };
  };



  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.city) {
      console.log(formData );
      toast.error('Please fill in all required fields');
      return;
    }

    // if (formData.category.length === 0) {
    //   toast.error('Please select at least one category');
    //   return;
    // }

    if (formData.communityType === 'special' && !formData.specialType) {
      toast.error('Please select a special community type');
      return;
    }

    // Backend: location must be one of "Abu Dhabi"|"Dubai"|"Al Ain"|"Sharjah"
    const location = COMMUNITY_LOCATION_OPTIONS.includes((formData.city || formData.location) as any)
      ? (formData.city || formData.location)
      : COMMUNITY_LOCATION_OPTIONS[0];

    // Map form data to backend API structure (type=array, category=string, trackId as string)
    const communityData = {
      title: formData.title,
      description: formData.description,
      type: Array.isArray(formData.type) ? formData.type : [formData.communityType ?? formData.type ?? 'city'],
      category: typeof formData.category === 'string' ? formData.category : (formData.category?.[0] ?? ''),
      location,
      area: formData.area || undefined,
      foundedYear: formData.foundedYear ?? undefined,
      image: formData.image || formData.logo || undefined,
      isFeatured: formData.isFeatured ?? false,
      isActive: formData.status === 'active',
      trackId: formData.primaryTrack ?? undefined,
      purposeType: formData.purposeType ?? '',
      ridesThisMonth: String(formData.ridesThisMonth ?? ''),
      weeklyRides: String(formData.weeklyRides ?? ''),
      fundsRaised: String(formData.fundsRaised ?? ''),
    };

    await updateCommunity(id, communityData);
    toast.success('Community updated successfully');
    // navigate(`/communities/${id}`);
  };

  const handleDisable = () => {
    updateCommunity(id, { isActive: false });
    toast.success('Community disabled');
    setShowDisableModal(false);
    navigate(`/communities/${id}`);
  };

  const handleArchive = () => {
    deleteCommunity(id);
    toast.success('Community archived');
    setShowArchiveModal(false);
    navigate('/communities');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/communities/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Edit Community</h1>
          <p style={{ color: '#666' }}>Update community information and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stats (Read-only) */}
          <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#FFF9EF' }}>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Current Stats (Read-only)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Members</p>
                <p className="text-2xl" style={{ color: '#333' }}>{existingCommunity.stats?.members?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Events</p>
                <p className="text-2xl" style={{ color: '#333' }}>{existingCommunity.stats?.upcomingEvents || 0}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Posts</p>
                <p className="text-2xl" style={{ color: '#333' }}>{existingCommunity.postsCount || 0}</p>
              </div>
            </div>
          </div>

          {/* SECTION 1 - Basic Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>1. Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Abu Dhabi Road Racers"
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
                  placeholder="Describe the community..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
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
                  {availableCities.map(city => (
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
                  placeholder="e.g., Yas Island, Corniche, Marina..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 - Community Classification */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>2. Community Classification</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Type *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'city' | 'type' | 'special' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="city">City Community</option>
                  <option value="type">Interest / Type Community</option>
                  <option value="special">Special Purpose Community</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-3" style={{ color: '#666' }}>Category (multi-select) *</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((item) => {
                    const isSelected = formData.type?.includes(item) || false;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCategory(item)}
                        className="px-3 py-2 rounded-lg text-sm transition-all"
                        style={{
                          backgroundColor: isSelected ? '#C12D32' : '#F3F4F6',
                          color: isSelected ? '#fff' : '#666',
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}


                </div>
              </div>

              {formData.communityType === 'special' && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Special Purpose Type *</label>
                  <select
                    value={formData.specialType || ''}
                    onChange={(e) => setFormData({ ...formData, specialType: (e.target.value as any) || null })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Select special type...</option>
                    <option value="awareness">Awareness</option>
                    <option value="charity">Charity</option>
                    <option value="corporate">Corporate</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="national-events">National Events</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3 - Tracks Mapping */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>3. Assign Primary Tracks</h2>
            </div>

            <div className="space-y-3">
              {filteredTracks.length > 0 ? (
                filteredTracks.map(track => (
                  <label
                    key={track._id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="primaryTrack"
                      checked={formData.primaryTrack === track._id}
                      onChange={() => toggleTrack(track._id)}
                      className="mt-1 w-4 h-4"
                      style={{ accentColor: '#C12D32' }}
                    />

                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#333' }}>
                        {track.title}
                      </p>

                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm" style={{ color: '#666' }}>
                          {track.city}
                        </span>

                        <span className="text-sm" style={{ color: '#666' }}>
                          {track.distance} km
                        </span>

                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor:
                              track.difficulty === 'Easy'
                                ? '#10B981'
                                : track.difficulty === 'Medium'
                                  ? '#F59E0B'
                                  : '#EF4444',
                            color: '#fff'
                          }}
                        >
                          {track.difficulty}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-center py-4" style={{ color: '#999' }}>
                  No tracks available in {formData.city}
                </p>
              )}

              {/* Keep your assigned count block exactly as is */}
              {formData.primaryTrack && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                  <p className="text-sm" style={{ color: '#666' }}>
                    1 track assigned
                  </p>
                </div>
              )}
            </div>


            {/* {formData.primaryTracks.length > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-sm" style={{ color: '#666' }}>
                  {formData.primaryTracks.length} {formData.primaryTracks.length === 1 ? 'track' : 'tracks'} assigned
                </p>
              </div>
            )} */}
          </div>

          {/* SECTION 4 - Community Stats */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>4. Community Stats</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Founded Year</label>
                <input
                  type="number"
                  value={formData.foundedYear || ''}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="2019"
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {formData.communityType === 'city' && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Rides This Month</label>
                  <input
                    type="number"
                    value={formData.ridesThisMonth || ''}
                    onChange={(e) => setFormData({ ...formData, ridesThisMonth: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="24"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              {formData.communityType === 'type' && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Weekly Rides</label>
                  <input
                    type="number"
                    value={formData.weeklyRides || ''}
                    onChange={(e) => setFormData({ ...formData, weeklyRides: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="6"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              {formData.communityType === 'special' && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Funds Raised (AED)</label>
                  <input
                    type="number"
                    value={formData.fundsRaised || ''}
                    onChange={(e) => setFormData({ ...formData, fundsRaised: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="125000"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Logo</label>
                <div className="mb-3">
                  <img src={existingCommunity.logo || formData.logo} alt="Current logo" className="w-20 h-20 rounded-lg object-cover" />
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload new logo</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Square format recommended</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image</label>
                <div className="mb-3">
                  <img src={existingCommunity.image || formData.image} alt="Current cover" className="w-full h-32 rounded-lg object-cover" />
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload new cover image</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 16:9 format recommended</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7 - Admin Assignment */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>7. Admin Assignment</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Manager name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Moderators (multi-select)</label>
                <p className="text-xs mb-2" style={{ color: '#999' }}>Feature coming soon</p>
              </div>
            </div>
          </div>

          {/* SECTION 8 - Advanced Controls (Edit Only) */}
          <div className="p-6 rounded-2xl shadow-sm bg-white border-2" style={{ borderColor: '#FEE2E2' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#C12D32' }} />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>8. Advanced Controls</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowDisableModal(true)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Disable Community</span>
              </button>

              <button
                onClick={() => setShowArchiveModal(true)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: '#C12D32', color: '#C12D32' }}
              >
                <Archive className="w-5 h-5" />
                <span>Archive Community</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SECTION 6 - Visibility & Rules */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>6. Visibility & Rules</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="inactive">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Join Mode</label>
                <select
                  value={formData.joinMode}
                  onChange={(e) => setFormData({ ...formData, joinMode: e.target.value as 'open' | 'approval' | 'invite' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="open">Open</option>
                  <option value="approval">Approval Required</option>
                  <option value="invite">Invite Only</option>
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

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPosts}
                    onChange={(e) => setFormData({ ...formData, allowPosts: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Allow Posts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowGallery}
                    onChange={(e) => setFormData({ ...formData, allowGallery: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Allow Gallery Uploads</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Actions</h3>

            <button
              onClick={handleUpdate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              Update Community
            </button>

            <button
              onClick={() => navigate(`/community/${id}`)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDisableModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Disable Community?</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              This will hide the community from public view. Members will not be able to access it. You can re-enable it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDisable}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Disable
              </button>
              <button
                onClick={() => setShowDisableModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowArchiveModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Archive Community?</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              This will permanently remove the community and all its data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#C12D32' }}
              >
                Archive
              </button>
              <button
                onClick={() => setShowArchiveModal(false)}
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
