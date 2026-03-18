import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Upload, Users, MapPin, Tag, Settings, Shield, Image as ImageIcon, Save, AlertTriangle, Archive, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { getCommunityById, updateCommunity, deleteCommunity as deleteCommunityApi, CommunityApiResponse, getAvailableCities, getAvailableCategories, COMMUNITY_LOCATION_OPTIONS } from '../../services/communitiesApi';
import { getAllTracksEn, deleteTrack } from '../../services/trackService';
import { CommunityFormData } from '../../types/community';
import { availableCategories } from '../../data/communitiesData';
import { DetailPageSkeleton } from '../ui/skeleton';


interface CommunityEditProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function CommunityEdit({ role }: CommunityEditProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [existingCommunity, setExistingCommunity] = useState<CommunityApiResponse | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
        toast.error(t('communities.edit.toasts.notFound'));
        // navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunity();
  }, [id]);

  // Load all tracks from API (getAllTracks returns Track[] directly) – does not control main loader
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const list = await getAllTracksEn();
        setTracks(Array.isArray(list) ? list : []);
      } catch (error) {
        toast.error(t('communities.edit.toasts.trackNotFound'));
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




  const [formData, setFormData] = useState<{
    title: string;
    titleAr: string;
    slug: string;
    description: string;
    descriptionAr: string;
    city: string;
    location: string;
    communityType: string;
    category: string;
    type: string[];
    country: string;
    area: string;
    primaryTrack: string;
    foundedYear: number | string | null;
    ridesThisMonth: number | string | null;
    weeklyRides: number | string | null;
    fundsRaised: number | string | null;
    purposeType: string;
    specialType: string;
    status: string;
    visibility: string;
    joinMode: string;
    displayPriority: number;
    isFeatured: boolean;
    allowPosts: boolean;
    allowGallery: boolean;
    manager: string;
    image: string;
    logo: string;
  }>({
    title: '',
    titleAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    city: '',
    location: '',
    communityType: 'city',
    category: '',
    type: [],
    country: 'UAE',
    area: '',
    primaryTrack: '',
    foundedYear: null,
    ridesThisMonth: null,
    weeklyRides: null,
    fundsRaised: null,
    purposeType: '',
    specialType: '',
    status: 'active',
    visibility: 'public',
    joinMode: 'open',
    displayPriority: 0,
    isFeatured: false,
    allowPosts: true,
    allowGallery: true,
    manager: '',
    image: '',
    logo: '',
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

    const loc = existingCommunity.location ?? '';
    const VALID_LOCATIONS = ['Abu Dhabi', 'Dubai', 'Al Ain', 'Sharjah'];
    const city = VALID_LOCATIONS.includes(loc) ? loc : (VALID_LOCATIONS.includes(existingCommunity.city ?? '') ? existingCommunity.city! : loc || 'Abu Dhabi');
    const country = existingCommunity.country ?? 'UAE';

    const typeArr = Array.isArray(existingCommunity.type)
      ? existingCommunity.type
      : typeof existingCommunity.type === 'string'
        ? [existingCommunity.type]
        : [];

    const raw = existingCommunity as unknown as Record<string, unknown>;
    const trackIdRaw = existingCommunity.trackId ?? (Array.isArray(raw.primaryTracks) ? raw.primaryTracks[0] : null) ?? raw.primaryTrackId ?? raw.track_id ?? (raw.track && typeof raw.track === 'object' ? (raw.track as { id?: string; _id?: string }).id ?? (raw.track as { _id?: string })._id : null) ?? raw.primaryTrackIds?.[0] ?? null;
    const primaryTrackStr =
      trackIdRaw == null
        ? ''
        : typeof trackIdRaw === 'string'
          ? trackIdRaw
          : (trackIdRaw as { _id?: string; id?: string })._id ?? (trackIdRaw as { id?: string }).id ?? '';

    const stats = existingCommunity.stats ?? (existingCommunity as any).stats;

    setFormData({
      title: existingCommunity.title ?? (existingCommunity as any).name ?? '',
      titleAr: (existingCommunity as any).titleAr ?? '',
      slug: existingCommunity.slug ?? '',
      description: existingCommunity.description ?? '',
      descriptionAr: (existingCommunity as any).descriptionAr ?? '',
      city: city || '',
      location: typeof loc === 'string' ? loc : `${city}, ${country}`,
      communityType: (() => {
        const CITY_CATS = ['City Communities'];
        const PURPOSE_CATS = ['Awareness & Charity', 'Corporate', 'Education', 'Health', 'Special Purpose'];
        if (typeArr.some(t => CITY_CATS.includes(t))) return 'city';
        if (typeArr.some(t => PURPOSE_CATS.includes(t))) return 'special';
        return typeArr.length > 0 ? 'type' : 'city';
      })(),
      category: typeof existingCommunity.category === 'string' ? existingCommunity.category : (existingCommunity.category?.[0] ?? ''),
      type: typeArr,
      country: country || 'UAE',
      area: existingCommunity.area ?? '',
      primaryTrack: primaryTrackStr,
      foundedYear: existingCommunity.foundedYear ?? null,
      ridesThisMonth: existingCommunity.ridesThisMonth ?? stats?.ridesThisMonth ?? null,
      weeklyRides: existingCommunity.weeklyRides ?? stats?.weeklyRides ?? null,
      fundsRaised: existingCommunity.fundsRaised ?? stats?.fundsRaised ?? null,
      purposeType: (existingCommunity as any).purposeType ?? existingCommunity.purposeType ?? '',
      specialType: (existingCommunity as any).specialType ?? '',
      status: (existingCommunity.status === true || existingCommunity.status === 'active' || existingCommunity.isActive) ? 'active' : 'inactive',
      visibility: existingCommunity.visibility ?? 'public',
      joinMode: (existingCommunity as any).joinMode ?? 'open',
      displayPriority: (existingCommunity as any).displayPriority ?? 0,
      isFeatured: existingCommunity.isFeatured ?? false,
      allowPosts: (existingCommunity as any).allowPosts ?? true,
      allowGallery: (existingCommunity as any).allowGallery ?? true,
      manager: existingCommunity.manager ?? '',
      image: existingCommunity.image ?? '',
      logo: existingCommunity.logo ?? '',
    });
  }, [existingCommunity]);

  if (isLoading || isMetadataLoading) {
    return <DetailPageSkeleton />;
  }

  if (!existingCommunity) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p style={{ color: '#666' }}>{t('communities.edit.notFound')}</p>
      </div>
    );
  }

  const mapCommunityToForm = (data: CommunityFormData & { slug?: string }) => ({
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
      primaryTrack: prev.primaryTrack === trackId ? '' : trackId,
    }));
  };

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setFormData((prev) => ({ ...prev, logo: URL.createObjectURL(file) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
  };



  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.city) {
      toast.error(t('communities.edit.toasts.missingRequired'));
      return;
    }

    // if (formData.category.length === 0) {
    //   toast.error('Please select at least one category');
    //   return;
    // }


    // Backend: location must be one of "Abu Dhabi"|"Dubai"|"Al Ain"|"Sharjah"
    const location = COMMUNITY_LOCATION_OPTIONS.includes((formData.city || formData.location) as any)
      ? (formData.city || formData.location)
      : COMMUNITY_LOCATION_OPTIONS[0];

    // Map form data to backend API structure; images sent as File in FormData (same key names: image, logo)
    const communityData = {
      title: formData.title,
      description: formData.description,
      ...(formData.titleAr?.trim() ? { titleAr: formData.titleAr.trim() } : {}),
      ...(formData.descriptionAr?.trim() ? { descriptionAr: formData.descriptionAr.trim() } : {}),
      type: (() => {
        const typeMarker = formData.communityType === 'city' ? 'City Communities'
          : formData.communityType === 'special' ? 'Special Purpose'
          : 'Group Communities';
        return [typeMarker];
      })(),
      category: Array.isArray(formData.type) ? formData.type.filter(t => !['City Communities', 'Special Purpose', 'Group Communities'].includes(t)).join(', ') : (formData.category || ''),
      location,
      area: formData.area || undefined,
      foundedYear: formData.foundedYear != null && formData.foundedYear !== '' ? Number(formData.foundedYear) : undefined,
      isFeatured: formData.isFeatured ?? false,
      isActive: formData.status === 'active',
      status: formData.status === 'active',
      trackId: formData.primaryTrack ?? undefined,
      purposeType: formData.purposeType ?? '',
      ridesThisMonth: String(formData.ridesThisMonth ?? ''),
      weeklyRides: String(formData.weeklyRides ?? ''),
      fundsRaised: String(formData.fundsRaised ?? ''),
    };

    const imageFiles = (imageFile || logoFile)
      ? { ...(imageFile ? { image: imageFile } : {}), ...(logoFile ? { logo: logoFile } : {}) }
      : undefined;

    try {
      await updateCommunity(id, communityData, imageFiles);
      toast.success(t('communities.edit.toasts.updateSuccess'));
      navigate(`/communities/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t('communities.edit.toasts.loadError', { defaultValue: 'Failed to update community' }));
    }
  };

  const handleEnable = async () => {
    if (!id) return;
    try {
      await updateCommunity(id, { status: true });
      setFormData((prev) => ({ ...prev, status: 'active' }));
      setExistingCommunity((prev) => (prev ? { ...prev, status: true, isActive: true } : null));
      toast.success(t('communities.edit.toasts.enabled'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t('communities.edit.toasts.loadError', { defaultValue: 'Failed to enable community' }));
    }
  };

  const handleDisable = async () => {
    if (!id) return;
    try {
      await updateCommunity(id, { status: false });
      setShowDisableModal(false);
      setFormData((prev) => ({ ...prev, status: 'inactive' }));
      setExistingCommunity((prev) => (prev ? { ...prev, status: false, isActive: false } : null));
      toast.success(t('communities.edit.toasts.disabled'));
      navigate(`/communities/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t('communities.edit.toasts.loadError', { defaultValue: 'Failed to disable community' }));
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      await deleteCommunityApi(id);
      setShowArchiveModal(false);
      toast.success(t('communities.edit.toasts.archived'));
      navigate('/communities');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t('communities.edit.toasts.loadError', { defaultValue: 'Failed to archive community' }));
    }
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
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('communities.edit.title')}</h1>
          <p style={{ color: '#666' }}>{t('communities.edit.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stats (Read-only) */}
          <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#FFF9EF' }}>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.edit.currentStats')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('communities.edit.members')}</p>
                <p className="text-2xl" style={{ color: '#333' }}>{existingCommunity.stats?.members?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('communities.edit.events')}</p>
                <p className="text-2xl" style={{ color: '#333' }}>{existingCommunity.stats?.upcomingEvents || 0}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>{t('communities.edit.posts')}</p>
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.basicInfo')}</h2>
            </div>

            <div className="space-y-4">
              {/* English Title */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('communities.edit.communityName')} <span className="text-gray-400">(English)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('communities.edit.placeholders.communityName')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Arabic Title */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  اسم المجتمع <span className="text-gray-400">(Arabic)</span>
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  placeholder="أبوظبي لسباق الطرق"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.slug')}</label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none"
                />
              </div>

              {/* English Description */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  {t('communities.edit.description')} <span className="text-gray-400">(English)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('communities.edit.placeholders.description')}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  الوصف <span className="text-gray-400">(Arabic)</span>
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  dir="rtl"
                  lang="ar"
                  rows={4}
                  placeholder="وصف المجتمع..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.country')}</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="UAE">{t('common.country.uae')}</option>
                  <option value="Saudi Arabia">{t('common.country.saudiArabia')}</option>
                  <option value="Kuwait">{t('common.country.kuwait')}</option>
                  <option value="Bahrain">{t('common.country.bahrain')}</option>
                  <option value="Oman">{t('common.country.oman')}</option>
                  <option value="Qatar">{t('common.country.qatar')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.city')}</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Select city...</option>
                  {COMMUNITY_LOCATION_OPTIONS.map((c) => (
                    <option key={c} value={c}>{t(`data.locations.${c}`, c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.area')}</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder={t('communities.edit.placeholders.area')}
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.classification')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.communityType')}</label>
                <select
                  value={formData.communityType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    // Remove old type markers, then add the correct one
                    const TYPE_MARKERS = ['City Communities', 'Special Purpose'];
                    const cleaned = (formData.type || []).filter(t => !TYPE_MARKERS.includes(t));
                    let updatedType = cleaned;
                    if (newType === 'city') updatedType = ['City Communities', ...cleaned];
                    else if (newType === 'special') updatedType = ['Special Purpose', ...cleaned];
                    setFormData({ ...formData, communityType: newType, type: updatedType });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="city">{t('communities.edit.typeOptions.city')}</option>
                  <option value="type">{t('communities.edit.typeOptions.interest')}</option>
                  <option value="special">{t('communities.edit.typeOptions.specialPurpose')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-3" style={{ color: '#666' }}>{t('communities.edit.category')}</label>
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
                        {t(`data.communityCategories.${item}`, item)}
                      </button>
                    );
                  })}


                </div>
              </div>

              {formData.communityType === 'special' && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.specialPurposeType')}</label>
                  <select
                    value={formData.purposeType}
                    onChange={(e) => setFormData({ ...formData, purposeType: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">{t('communities.create.specialPurposeOptions.select')}</option>
                    <option value="awareness">{t('communities.create.specialPurposeOptions.awareness')}</option>
                    <option value="charity">{t('communities.create.specialPurposeOptions.charity')}</option>
                    <option value="corporate">{t('communities.create.specialPurposeOptions.corporate')}</option>
                    <option value="education">{t('communities.create.specialPurposeOptions.education')}</option>
                    <option value="health">{t('communities.create.specialPurposeOptions.health')}</option>
                    <option value="national-events">{t('communities.create.specialPurposeOptions.nationalEvents')}</option>
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.tracks')}</h2>
            </div>

            <div className="space-y-3">
              {filteredTracks.length > 0 ? (
                filteredTracks.map(track => (
                  <label
                    key={track._id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
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
                  {t('communities.edit.noTracksInCity', { city: formData.city })}
                </p>
              )}

              {/* Keep your assigned count block exactly as is */}
              {formData.primaryTrack && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                  <p className="text-sm" style={{ color: '#666' }}>
                    {t('communities.edit.oneTrackAssigned')}
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.communityStats')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.foundedYear')}</label>
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
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.ridesThisMonth')}</label>
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
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.weeklyRides')}</label>
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

              {(formData.communityType === 'purpose-based' || formData.communityType === 'special') && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.fundsRaised')}</label>
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.media')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.communityLogo')}</label>
                <div className="mb-3">
                  {(existingCommunity.logo || formData.logo) ? (
                    <img src={existingCommunity.logo || formData.logo} alt="Current logo" className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs" style={{ color: '#999' }}>No logo</div>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => logoInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('communities.edit.uploadLogo')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('communities.edit.logoHint')}</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.coverImage')}</label>
                <div className="mb-3">
                  {(existingCommunity.image || formData.image) ? (
                    <img src={existingCommunity.image || formData.image} alt="Current cover" className="w-full h-32 rounded-lg object-cover" />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center text-sm" style={{ color: '#999' }}>No cover image</div>
                  )}
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => coverInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && coverInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>{t('communities.edit.uploadCover')}</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>{t('communities.edit.coverHint')}</p>
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
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.adminAssignment')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.communityManager')}</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder={t('communities.edit.placeholders.manager')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.moderators')}</label>
                <p className="text-xs mb-2" style={{ color: '#999' }}>{t('communities.edit.featureComingSoon')}</p>
              </div>
            </div>
          </div>

          {/* SECTION 8 - Advanced Controls (Edit Only) */}
          <div className="p-6 rounded-2xl shadow-sm bg-white border-2" style={{ borderColor: '#FEE2E2' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#C12D32' }} />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>{t('communities.edit.advancedControls')}</h2>
            </div>

            <div className="space-y-3">
              {formData.status === 'active' ? (
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t('communities.edit.disable')}</span>
                </button>
              ) : (
                <button
                  onClick={handleEnable}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('communities.edit.enable')}</span>
                </button>
              )}

              <button
                onClick={() => setShowArchiveModal(true)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: '#C12D32', color: '#C12D32' }}
              >
                <Archive className="w-5 h-5" />
                <span>{t('communities.edit.archive')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SECTION 6 - Visibility & Rules */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.edit.visibilityRules')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="inactive">{t('communities.edit.statusOptions.draft')}</option>
                  <option value="active">{t('communities.edit.statusOptions.active')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.visibility')}</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="public">{t('communities.edit.visibilityOptions.public')}</option>
                  <option value="private">{t('communities.edit.visibilityOptions.private')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.joinMode')}</label>
                <select
                  value={formData.joinMode}
                  onChange={(e) => setFormData({ ...formData, joinMode: e.target.value as 'open' | 'approval' | 'invite' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="open">{t('communities.edit.joinModeOptions.open')}</option>
                  <option value="approval">{t('communities.edit.joinModeOptions.approvalRequired')}</option>
                  <option value="invite">{t('communities.edit.joinModeOptions.inviteOnly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('communities.edit.displayPriority')}</label>
                <input
                  type="number"
                  value={formData.displayPriority}
                  onChange={(e) => setFormData({ ...formData, displayPriority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-xs mt-1" style={{ color: '#999' }}>{t('communities.edit.displayPriorityHint')}</p>
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
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.edit.featuredHomepage')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPosts}
                    onChange={(e) => setFormData({ ...formData, allowPosts: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.edit.allowPosts')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowGallery}
                    onChange={(e) => setFormData({ ...formData, allowGallery: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.edit.allowGallery')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.edit.actions')}</h3>

            <button
              onClick={handleUpdate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-5 h-5" />
              {t('communities.edit.updateCommunity')}
            </button>

            <button
              onClick={() => navigate(`/communities/${id}`)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDisableModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.edit.disableModal.title')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('communities.edit.disableModal.body')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDisable}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#F59E0B' }}
              >
                {t('communities.edit.disableModal.confirm')}
              </button>
              <button
                onClick={() => setShowDisableModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('communities.edit.disableModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowArchiveModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.edit.archiveModal.title')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('communities.edit.archiveModal.body')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('communities.edit.archiveModal.confirm')}
              </button>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('communities.edit.archiveModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
