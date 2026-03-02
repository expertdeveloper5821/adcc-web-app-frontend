import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CommunityFormData, GCCCountry, CommunityType } from '../../types/community';
import { gccCountries, getCitiesByCountry } from '../../data/gccLocations';
import { getTracksByCountryAndCity } from '../../data/tracksData';
import { compressImage } from '../../utils/imageUtils';

// Validation schema using Zod
const communityFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  country: z.enum(['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman']),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  communityType: z.enum(['city', 'type', 'purpose-based']),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  purposeType: z.string().nullable().optional(),
  primaryTrackIds: z.array(z.string()),
  foundedYear: z.number().min(2000).max(new Date().getFullYear()).nullable().optional(),
  ridesThisMonth: z.number().min(0).nullable().optional(),
  weeklyRides: z.number().min(0).nullable().optional(),
  fundsRaised: z.number().min(0).nullable().optional(),
  image: z.string().optional(),
  managerName: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  visibility: z.enum(['public', 'private']),
  joinMode: z.enum(['open', 'approval', 'invite']),
  displayPriority: z.number().min(0),
  isFeatured: z.boolean(),
  allowPosts: z.boolean(),
  allowGallery: z.boolean(),
}).passthrough(); // Allow legacy fields

type CommunityFormSchema = z.infer<typeof communityFormSchema>;

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
  const [isCompressing, setIsCompressing] = useState(false);

  const form = useForm<CommunityFormSchema>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      title: '',
      description: '',
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

      const primaryTrackIds = (initialData as any).primaryTracks || [];

      setSelectedCountry(country as GCCCountry);
      setSelectedCity(city);
      setSelectedCategories(categories);
      setSelectedTrackIds(primaryTrackIds);
      
      if (initialData.image) {
        setImagePreview(initialData.image);
      }

      reset({
        title: initialData.title || '',
        description: initialData.description || '',
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

  const availableCities = getCitiesByCountry(selectedCountry);
  const tracks = getTracksByCountryAndCity(selectedCountry, selectedCity);

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

  const toggleTrack = useCallback((trackId: string) => {
    setSelectedTrackIds(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file);
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

  return {
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
  };
};