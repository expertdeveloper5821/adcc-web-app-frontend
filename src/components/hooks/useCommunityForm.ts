import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { CommunityFormData, GCCCountry, CommunityType } from '../../types/community';
import type { CommunityApiResponse } from '../../services/communitiesApi';

import { getAllTracks } from '../../services/trackService';import { gccCountries, getCitiesByCountry } from '../../data/gccLocations';
import { getAllTracks, type Track as ApiTrack } from '../../services/trackService';
import { compressImage } from '../../utils/imageUtils';

/** Map API track to TrackSelector shape and normalize id (_id from MongoDB). */
function toSelectorTrack(t: ApiTrack & { _id?: string }) {
  const id = t.id ?? t._id ?? '';
  const difficulty = t.difficulty ? String(t.difficulty).charAt(0).toUpperCase() + String(t.difficulty).slice(1) : '';
  return {
    id,
    name: t.title ?? '',
    description: t.shortDescription ?? '',
    distance: t.distance ?? 0,
    difficulty,
    trackType: t.trackType ?? '',
  };
}

// Coerce empty string from number inputs to undefined so optional number fields don't fail and scroll to this section
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? undefined : n;
    },
    schema.nullable().optional()
  );
// Validation schema using Zod
const communityFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  titleAr: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  descriptionAr: z.string().optional(),
  country: z.enum(['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman']),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  communityType: z.enum(['city', 'type', 'purpose-based']),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  purposeType: z.string().nullable().optional(),
  primaryTrackIds: z.array(z.string()),
  foundedYear: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return Number.isNaN(num) ? null : num;
    },
    z.number().min(2000).max(new Date().getFullYear()).nullable().optional()
  ),
  ridesThisMonth: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return Number.isNaN(num) ? null : num;
    },
    z.number().min(0).nullable().optional()
  ),
  weeklyRides: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return Number.isNaN(num) ? null : num;
    },
    z.number().min(0).nullable().optional()
  ),
  fundsRaised:z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return Number.isNaN(num) ? null : num;
    },
    z.number().min(0).nullable().optional()
  ),
  image: z.string().optional(),
  logo: z.string().optional(),
  managerName: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  visibility: z.enum(['public', 'private']),
  joinMode: z.enum(['open', 'approval', 'invite']),
  displayPriority: z.coerce.number().min(0),
  isFeatured: z.boolean(),
  allowPosts: z.boolean(),
  allowGallery: z.boolean(),
}).passthrough(); // Allow legacy fields

type CommunityFormSchema = z.infer<typeof communityFormSchema>;

type CommunityFormValues = Omit<CommunityFormSchema, 'foundedYear' | 'ridesThisMonth' | 'weeklyRides' | 'fundsRaised' | 'displayPriority'> & {
  foundedYear?: number | null;
  ridesThisMonth?: number | null;
  weeklyRides?: number | null;
  fundsRaised?: number | null;
  displayPriority: number;
};

interface UseCommunityFormProps {
  initialData?: CommunityApiResponse | null;
  isEditMode: boolean;
}

export const useCommunityForm = ({ initialData, isEditMode }: UseCommunityFormProps) => {
  const [selectedCountry, setSelectedCountry] = useState<GCCCountry>('UAE');
  const [selectedCity, setSelectedCity] = useState('Abu Dhabi');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [allTracks, setAllTracks] = useState<(ApiTrack & { _id?: string })[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communityFormSchema) as unknown as Resolver<CommunityFormValues>,
    defaultValues: {
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      country: 'UAE',
      city: 'Abu Dhabi',
      area: '',
      communityType: 'city',
      categories: [],
      purposeType: null,
      primaryTrackIds: [],
      foundedYear: null,
      ridesThisMonth: null,
      weeklyRides: null,
      fundsRaised: null,
      image: '',
      logo: '',
      managerName: '',
      status: 'inactive',
      visibility: 'public',
      joinMode: 'open',
      displayPriority: 0,
      isFeatured: false,
      allowPosts: true,
      allowGallery: true,
      // Legacy fields
      type: 'city',
      category: [],
      location: 'Abu Dhabi, UAE',
      isActive: false,
    },
  });

  const { reset, setValue, watch } = form;
  const communityType = watch('communityType');

  // Initialize form with existing data
  useEffect(() => {
    if (initialData && isEditMode) {
      // Parse location
      const location = initialData.location || 'Abu Dhabi, UAE';
      const [city = 'Abu Dhabi', country = 'UAE'] = location.split(', ');

      const categories = Array.isArray(initialData.category)
        ? initialData.category
        : initialData.category?.split(',').map(c => c.trim()).filter(Boolean) || [];

      const raw = (initialData as any).primaryTracks || (initialData as any).primaryTrackIds || [];
      const primaryTrackIds = raw.map((p: any) => (typeof p === 'string' ? p : p?._id ?? p?.id)).filter(Boolean);

      setSelectedCountry(country as GCCCountry);
      setSelectedCity(city);
      setSelectedCategories(categories);
      setSelectedTrackIds(primaryTrackIds);

      if (initialData.image) {
        setImagePreview(initialData.image);
      }
      if ((initialData as any).logo) {
        setLogoPreview((initialData as any).logo);
      }

      reset({
        title: initialData.title || '',
        titleAr: (initialData as any).titleAr || '',
        description: initialData.description || '',
        descriptionAr: (initialData as any).descriptionAr || '',
        country: country as GCCCountry,
        city,
        area: (initialData as any).area || '',
        communityType: (initialData as any).communityType || 'city',
        categories,
        purposeType: (initialData as any).purposeType || null,
        primaryTrackIds,
        foundedYear: (initialData as any).foundedYear || null,
        ridesThisMonth: (initialData as any).ridesThisMonth || null,
        weeklyRides: (initialData as any).weeklyRides || null,
        fundsRaised: (initialData as any).fundsRaised || null,
        image: initialData.image || '',
        logo: (initialData as any).logo || '',
        managerName: (initialData as any).managerName || '',
        status: (initialData as any).status || (initialData.isActive ? 'active' : 'inactive'),
        visibility: (initialData as any).visibility || 'public',
        joinMode: (initialData as any).joinMode || 'open',
        displayPriority: (initialData as any).displayPriority || 0,
        isFeatured: (initialData as any).isFeatured || false,
        allowPosts: (initialData as any).allowPosts ?? true,
        allowGallery: (initialData as any).allowGallery ?? true,
        // Legacy fields
        type: initialData.type || 'city',
        category: categories,
        location: initialData.location || `${city}, ${country}`,
        isActive: initialData.isActive,
      });
    }
  }, [initialData, isEditMode, reset]);

  // Update location when country/city changes
  useEffect(() => {
    const location = `${selectedCity}, ${selectedCountry}`;
    setValue('location', location);
    setValue('city', selectedCity);
    setValue('country', selectedCountry);
  }, [selectedCity, selectedCountry, setValue]);

  // Update form when track selection changes
  useEffect(() => {
    setValue('primaryTrackIds', selectedTrackIds);
  }, [selectedTrackIds, setValue]);

  // Fetch tracks from API (dynamic instead of hardcoded)
  useEffect(() => {
    let cancelled = false;
    const fetchTracks = async () => {
      try {
        setTracksLoading(true);
        const data = await getAllTracks();
        if (!cancelled && Array.isArray(data)) {
          setAllTracks(data);
        }
      } catch {
        if (!cancelled) setAllTracks([]);
      } finally {
        if (!cancelled) setTracksLoading(false);
      }
    };
    fetchTracks();
    return () => { cancelled = true; };
  }, []);

  const availableCities = getCitiesByCountry(selectedCountry);

  // Load tracks from database (API)
  const [tracksFromApi, setTracksFromApi] = useState<any[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setTracksLoading(true);
    getAllTracks()
      .then((res) => {
        console.log( "this is a trck",res)
        const list = Array.isArray(res) ? res : (res as any)?.tracks ?? (res as any)?.data ?? [];
        if (!cancelled) setTracksFromApi(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setTracksFromApi([]);
      })
      .finally(() => {
        if (!cancelled) setTracksLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Filter tracks by selected city (and optionally country); map to shape expected by TrackSelector (id = backend _id/id for payload)
  const tracks = useMemo(() => {
    if (!tracksFromApi.length) return [];
    const cityNorm = (selectedCity || '').toLowerCase().trim();
    const countryNorm = (selectedCountry || '').toLowerCase().trim();
    const filtered = tracksFromApi.filter((t) => {
      const tCity = (t.city || t.area || '').toLowerCase().trim();
      const tCountry = (t.country || '').toLowerCase().trim();
      const cityMatch = !cityNorm || tCity.includes(cityNorm) || cityNorm.includes(tCity);
      const countryMatch = !countryNorm || tCountry.includes(countryNorm) || countryNorm.includes(tCountry);
      return cityMatch && countryMatch;
    });
    return filtered.map((t) => ({
      id: t._id || t.id,
      name: t.title || t.name,
      description: t.shortDescription || t.description || '',
      distance: t.distance ?? 0,
      difficulty: t.difficulty ?? '—',
      trackType: t.trackType ?? '—',
    })).filter((t) => t.id);
  }, [tracksFromApi, selectedCity, selectedCountry]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];

      setValue('categories', newCategories);
      setValue('category', newCategories);
      setValue('type', newCategories[0]?.toLowerCase() || 'city');

      return newCategories;
    });
  }, [setValue]);

  // Single selection only: selecting a track replaces current selection; click again to deselect
  const toggleTrack = useCallback((trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId) ? [] : [trackId]
    );
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file, 1200, 600, 0.75);
      setImagePreview(compressedBase64);
      setValue('image', compressedBase64);
      return { success: true, data: compressedBase64 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to process image' };
    } finally {
      setIsCompressing(false);
    }
  }, [setValue]);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setValue('image', '');
  }, [setValue]);

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file, 400, 400, 0.8);
      setLogoPreview(compressedBase64);
      setValue('logo', compressedBase64);
      return { success: true, data: compressedBase64 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to process logo' };
    } finally {
      setIsCompressing(false);
    }
  }, [setValue]);

  const clearLogo = useCallback(() => {
    setLogoPreview(null);
    setValue('logo', '');
  }, [setValue]);

  return {
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
  };
};