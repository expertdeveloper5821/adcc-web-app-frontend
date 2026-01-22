import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Search } from 'lucide-react';
import { createCommunity, updateCommunity, getCommunityById, CreateCommunityRequest, CommunityApiResponse } from '../../services/communitiesApi';
import { toast } from 'sonner';
import { Input } from '../ui/input';

const availableCategories = [
  'City Communities',
  'Group Communities',
  'Awareness & special communities',
];

interface CommunityCreateProps {
  navigate?: (page: string, params?: any) => void;
  editingCommunity?: any;
  communityId?: string;
}

interface FormData extends CreateCommunityRequest {
  imageFile?: File | null;
  city?: string;
  isFeatured?: boolean;
}

export function CommunityCreate({ editingCommunity: propEditingCommunity, communityId: propCommunityId }: CommunityCreateProps = {}) {
  const location = useLocation();
  // Get editing data from location state (React Router v6 way)
  const locationState = location.state as { editingCommunity?: CommunityApiResponse; communityId?: string } | null;
  const [fetchedCommunity, setFetchedCommunity] = useState<CommunityApiResponse | null>(null);
  const editingCommunity = propEditingCommunity || locationState?.editingCommunity || fetchedCommunity;
  const stateCommunityId = propCommunityId || locationState?.communityId;
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'city',
      category: [],
      location: 'Abu Dhabi',
      city: 'Abu Dhabi',
      image: '',
      trackName: '',
      distance: undefined,
      terrain: 'Paved Road',
      isActive: true,
      isFeatured: false,
    },
  });

  // Fetch community data if only ID is provided (from CommunitiesList edit button)
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (stateCommunityId && !propEditingCommunity && !locationState?.editingCommunity && !fetchedCommunity) {
        try {
          setIsLoading(true);
          const communityData = await getCommunityById(stateCommunityId);
          setFetchedCommunity(communityData);
        } catch (error: any) {
          console.error('Error fetching community:', error);
          toast.error(error?.response?.data?.message || 'Failed to load community data');
          navigate('/communities');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCommunityData();
  }, [stateCommunityId, propEditingCommunity, locationState, fetchedCommunity, navigate]);

  // Check if we're in edit mode and load community data, or reset to create mode
  useEffect(() => {
    const currentEditingCommunity = propEditingCommunity || locationState?.editingCommunity || fetchedCommunity;
    const currentCommunityId = propCommunityId || locationState?.communityId || stateCommunityId;

    if (currentEditingCommunity && currentCommunityId) {
      // Edit mode: populate form with existing data
      setIsEditMode(true);
      setCommunityId(currentCommunityId);
      
      // Handle categories if category contains comma-separated values or is an array
      let categoryArray: string[] = [];
      if (currentEditingCommunity.category) {
        categoryArray = Array.isArray(currentEditingCommunity.category) 
          ? currentEditingCommunity.category 
          : currentEditingCommunity.category.split(',').map((c: string) => c.trim()).filter(Boolean);
        setSelectedCategories(categoryArray);
      }

      // Populate form with existing data
      reset({
        title: currentEditingCommunity.title || '',
        description: currentEditingCommunity.description || '',
        type: currentEditingCommunity.type || 'city',
        category: categoryArray,
        location: currentEditingCommunity.location || 'Abu Dhabi',
        image: currentEditingCommunity.image || '',
        trackName: currentEditingCommunity.trackName || '',
        distance: currentEditingCommunity.distance || undefined,
        terrain: currentEditingCommunity.terrain || 'Paved Road',
        isActive: currentEditingCommunity.isActive !== undefined ? currentEditingCommunity.isActive : true,
        isFeatured: (currentEditingCommunity as any).isFeatured !== undefined ? (currentEditingCommunity as any).isFeatured : false,
      });

      if (currentEditingCommunity.image) {
        setImagePreview(currentEditingCommunity.image);
      }
    } else {
      // Create mode: reset form to default values
      setIsEditMode(false);
      setCommunityId(null);
      setSelectedCategories([]);
      setImagePreview(null);
      setValidationErrors({});
      setCategorySearchTerm('');
      
      // Reset form to default values
      reset({
        title: '',
        description: '',
        type: 'city',
        category: [],
        location: 'Abu Dhabi',
        city: 'Abu Dhabi',
        image: '',
        trackName: '',
        distance: undefined,
        terrain: 'Paved Road',
        isActive: true,
        isFeatured: false,
      });
    }
  }, [propEditingCommunity, locationState, fetchedCommunity, propCommunityId, stateCommunityId, reset]);

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    // Get current form values
    const currentValues = watch();
    // Explicitly get location from form state to ensure correct city value
    const locationValue = getValues('location');
    
    const title = (formData.title || currentValues.title || '').toString().trim();
    const description = (formData.description || currentValues.description || '').toString().trim();
    const location = (locationValue || currentValues.location || 'Abu Dhabi').toString().trim();
    const type = (formData.type || currentValues.type || '').toString().trim();
    // Category should be an array - use selectedCategories
    const category = selectedCategories.length > 0 
      ? selectedCategories 
      : (Array.isArray(formData.category) ? formData.category : []);
    const distance = formData.distance !== undefined ? formData.distance : (currentValues.distance !== undefined ? currentValues.distance : undefined);

    // Validate title
    if (!title) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Validate description
    if (!description) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Validate categories - category is now an array
    const categories = selectedCategories.length > 0 
      ? selectedCategories 
      : (Array.isArray(category) ? category : []);
    
    if (categories.length === 0) {
      newErrors.category = 'At least one category is required';
    }

    // Validate location (city)
    if (!location) {
      newErrors.location = 'City is required';
    }

    // Validate type
    if (!type) {
      newErrors.type = 'Type is required';
    }

    // Validate distance (if provided)
    if (distance !== undefined && distance !== null) {
      const distanceNum = Number(distance);
      if (isNaN(distanceNum) || distanceNum < 0) {
        newErrors.distance = 'Distance must be a positive number';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check file size first (max 10MB before compression)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        reject(new Error('Image file is too large. Maximum size is 10MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions - reduced max size to prevent large payloads
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Target max base64 size: 500KB (to stay well under typical 1MB limits)
          const maxBase64Size = 500 * 1024; // 500KB
          let currentQuality = quality;
          let base64String = canvas.toDataURL('image/jpeg', currentQuality);
          
          // Iteratively reduce quality until we're under the size limit
          let attempts = 0;
          const maxAttempts = 5;
          while (base64String.length > maxBase64Size && attempts < maxAttempts) {
            currentQuality -= 0.1;
            if (currentQuality < 0.3) {
              currentQuality = 0.3; // Don't go below 30% quality
              break;
            }
            base64String = canvas.toDataURL('image/jpeg', currentQuality);
            attempts++;
          }
          
          // Final check - if still too large, reduce dimensions
          if (base64String.length > maxBase64Size) {
            // Reduce dimensions by 20% and try again
            width = Math.floor(width * 0.8);
            height = Math.floor(height * 0.8);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            base64String = canvas.toDataURL('image/jpeg', 0.5);
          }
          
          resolve(base64String);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 10MB before compression)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        setValidationErrors(prev => ({ ...prev, image: 'Image file is too large. Maximum size is 10MB.' }));
        return;
      }

      try {
        setIsCompressingImage(true);
        const compressedBase64 = await compressImage(file);
        
      // Check final size (max 500KB base64 string to prevent payload errors)
      const base64Size = compressedBase64.length * 0.75; // Approximate byte size
      if (base64Size > 500 * 1024) {
        setValidationErrors(prev => ({ ...prev, image: 'Image is too large even after compression. Please use a smaller image (max 500KB).' }));
        setIsCompressingImage(false);
        return;
      }

        setImagePreview(compressedBase64);
        setValue('image', compressedBase64);
        
        // Clear any previous image errors
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      } catch (error: any) {
        console.error('Error compressing image:', error);
        setValidationErrors(prev => ({ ...prev, image: error.message || 'Failed to process image' }));
      } finally {
        setIsCompressingImage(false);
      }
    }
  };

  const onSubmit = async (formData: FormData) => {
    // Clear previous errors
    setValidationErrors({});

    // Get current form values to ensure we have the latest
    const currentValues = watch();
    // Explicitly get location from form state to ensure we get the correct city value
    const locationValue = getValues('location');
    
    const title = (formData.title || currentValues.title || '').toString().trim();
    const description = (formData.description || currentValues.description || '').toString().trim();
    const type = (formData.type || currentValues.type || '').toString().trim();
    // Use selectedCategories for category field - send as array
    const category = selectedCategories.length > 0 
      ? selectedCategories 
      : (formData.category ? (Array.isArray(formData.category) ? formData.category : [formData.category]) : []);
    // Location should be the city from the dropdown - use getValues to ensure correct value
    const location = (locationValue || currentValues.location || 'Abu Dhabi').toString().trim();

    // Validate form manually with actual values
    const validationData: FormData = {
      ...formData,
      title,
      description,
      type,
      category,
      location,
    };

    if (!validateForm(validationData)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get isFeatured from form data
      const isFeatured = formData.isFeatured !== undefined ? formData.isFeatured : (currentValues.isFeatured !== undefined ? currentValues.isFeatured : false);
      
      // Build the request payload
      const communityData: CreateCommunityRequest & { isFeatured?: boolean } = {
        title,
        description,
        type,
        category,
        location,
        isActive: formData.isActive !== undefined ? formData.isActive : (currentValues.isActive !== undefined ? currentValues.isActive : true),
        isFeatured: isFeatured,
      };

      // Only add optional fields if they have values
      const image = (formData.image || currentValues.image || '').toString().trim();
      const trackName = (formData.trackName || currentValues.trackName || '').toString().trim();
      const terrain = (formData.terrain || currentValues.terrain || '').toString().trim();
      const distance = formData.distance !== undefined ? formData.distance : (currentValues.distance !== undefined ? currentValues.distance : undefined);

      // Check image size before sending (max 500KB base64 to prevent payload errors)
      if (image) {
        const base64Size = image.length * 0.75; // Approximate byte size
        if (base64Size > 500 * 1024) {
          setValidationErrors(prev => ({ ...prev, image: 'Image is too large. Maximum size is 500KB after compression.' }));
          setIsLoading(false);
          toast.error('Image is too large. Please use a smaller image (max 500KB).');
          return;
        }
        communityData.image = image;
      }
      
      if (trackName) {
        communityData.trackName = trackName;
      }
      
      if (distance !== undefined && distance !== null) {
        const distanceNum = Number(distance);
        if (!isNaN(distanceNum) && distanceNum >= 0) {
          communityData.distance = distanceNum;
        }
      }
      
      if (terrain) {
        communityData.terrain = terrain;
      }

      

      let result: CommunityApiResponse;
      if (isEditMode && communityId) {
        result = await updateCommunity(communityId, communityData);
        toast.success('Community updated successfully');
        navigate(`/communities/${communityId}`);
      } else {
        result = await createCommunity(communityData);
        toast.success('Community created successfully');
      }

      const id = result._id || result.id || communityId;
      if (id) {
        navigate(`/communities/${id}`);
      } else {
        navigate('/communities');
      }
    } catch (error: any) {
      console.error('Error saving community:', error);
      
      // Handle payload too large error specifically
      if (error?.response?.status === 413 || error?.message?.includes('PayloadTooLargeError') || error?.message?.includes('request entity too large')) {
        setValidationErrors(prev => ({ ...prev, image: 'Image is too large. Please use a smaller image or contact support.' }));
        toast.error('Image file is too large. Please use a smaller image (under 500KB).');
        setIsLoading(false);
        return;
      }
      
      // Handle validation errors from API
      if (error?.response?.status === 400 || error?.response?.status === 422) {
        const errorData = error.response.data;
        const apiErrors: Record<string, string> = {};
        
        // Set field-level errors from API response
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((field) => {
            const fieldName = field as keyof FormData;
            apiErrors[field] = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          });
          setValidationErrors(apiErrors);
        }
        
        // Show general error message
        const errorMessage = errorData.message || 'Validation failed. Please check the form fields.';
        toast.error(errorMessage);
      } else {
        toast.error(error?.response?.data?.message || 'Failed to save community');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: keyof FormData): string | undefined => {
    return validationErrors[fieldName];
  };

  const hasError = (fieldName: keyof FormData): boolean => {
    return !!validationErrors[fieldName];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => (isEditMode ? navigate(-1) : navigate('/communities'))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
            {isEditMode ? 'Edit Community' : 'Create Community'}
          </h1>
          <p style={{ color: '#666' }}>Add a new cycling community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>Basic Information</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>
                    Title *
                  </label>
                  <Input
                    {...register('title', {
                      onChange: () => {
                        if (validationErrors.title) {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.title;
                            return newErrors;
                          });
                        }
                      },
                    })}
                    placeholder="e.g., Abu Dhabi Community"
                    aria-invalid={hasError('title')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      hasError('title')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                    } focus:outline-none`}
                  />
                  {hasError('title') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
                  )}
                </div>

                

                {/* Type and Category */}
                <div className="grid grid-cols-2 gap-4">

                <div>
                    <label className="block text-sm mb-2" style={{ color: '#666' }}>
                    City *
                    </label>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            value={field.value || 'Abu Dhabi'}
                            onChange={(e) => {
                              const selectedCity = e.target.value;
                              field.onChange(selectedCity);
                              setValue('location', selectedCity, { shouldValidate: true });
                              if (validationErrors.location) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.location;
                                  return newErrors;
                                });
                              }
                            }}
                            aria-invalid={hasError('location')}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              hasError('location')
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                            } focus:outline-none`}
                          >
                            <option value="Abu Dhabi">Abu Dhabi</option>
                            <option value="Dubai">Dubai</option>
                            <option value="Sharjah">Sharjah</option>
                            <option value="Al Ain">Al Ain</option>
                            
                          </select>
                          {hasError('location') && (
                            <p className="mt-1 text-sm text-red-600">{getFieldError('location')}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#666' }}>
                      Type *
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (validationErrors.type) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.type;
                                  return newErrors;
                                });
                              }
                            }}
                            aria-invalid={hasError('type')}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              hasError('type')
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                            } focus:outline-none`}
                          >
                            <option value="city">City</option>
                            <option value="Club">Club</option>
                            <option value="Shop">Shop</option>
                            <option value="Women">Women</option>
                            <option value="Youth">Youth</option>
                            <option value="Family">Family</option>
                            <option value="Corporate">Corporate</option>
                          </select>
                          {hasError('type') && (
                            <p className="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>
                    Description *
                  </label>
                  <textarea
                    {...register('description', {
                      onChange: () => {
                        if (validationErrors.description) {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.description;
                            return newErrors;
                          });
                        }
                      },
                    })}
                    placeholder="A community for cyclists in Abu Dhabi"
                    rows={4}
                    aria-invalid={hasError('description')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      hasError('description')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                    } focus:outline-none`}
                  />
                  {hasError('description') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                  )}
                </div>

                {/* Category Multi-Select */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>
                    Category *
                  </label>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    {availableCategories
                      .filter(category =>
                        category.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      )
                      .map((category) => {
                        const isSelected = selectedCategories.includes(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                const newCategories = selectedCategories.filter(c => c !== category);
                                setSelectedCategories(newCategories);
                                setValue('category', newCategories);
                              } else {
                                const newCategories = [...selectedCategories, category];
                                setSelectedCategories(newCategories);
                                setValue('category', newCategories);
                              }
                              
                              // Clear error when selecting
                              if (validationErrors.category) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.category;
                                  return newErrors;
                                });
                              }
                            }}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md"
                            style={{
                              backgroundColor: isSelected ? '#C12D32' : '#ECC180',
                              color: isSelected ? '#fff' : '#333',
                            }}
                          >
                            {category}
                          </button>
                        );
                      })}
                  </div>

                  {/* Selected Categories Count */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                      <div className="text-sm" style={{ color: '#666' }}>
                        Selected: <span style={{ color: '#C12D32' }}>{selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'}</span>
                      </div>
                    </div>
                  )}

                  {hasError('category') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('category')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Track Information */}
            {/* <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>Track Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>
                    Track Name
                  </label>
                  <Input
                    {...register('trackName')}
                    placeholder="e.g., Corniche Track"
                    aria-invalid={hasError('trackName')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      hasError('trackName')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                    } focus:outline-none`}
                  />
                  {hasError('trackName') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('trackName')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#666' }}>
                      Distance (km)
                    </label>
                    <Input
                      type="number"
                      {...register('distance', {
                        valueAsNumber: true,
                        onChange: () => {
                          if (validationErrors.distance) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.distance;
                              return newErrors;
                            });
                          }
                        },
                      })}
                      placeholder="15"
                      aria-invalid={hasError('distance')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        hasError('distance')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                      } focus:outline-none`}
                    />
                    {hasError('distance') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('distance')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#666' }}>
                      Terrain
                    </label>
                    <Controller
                      name="terrain"
                      control={control}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            aria-invalid={hasError('terrain')}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              hasError('terrain')
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-200 focus:ring-2 focus:ring-[#C12D32]'
                            } focus:outline-none`}
                          >
                            <option value="Paved Road">Paved Road</option>
                            <option value="Mountain">Mountain</option>
                            <option value="Trail">Trail</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                          {hasError('terrain') && (
                            <p className="mt-1 text-sm text-red-600">{getFieldError('terrain')}</p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div> */}

            {/* Image Upload */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Image</h2>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  Image
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                      hasError('image') ? 'border-red-500' : 'border-[#ECC180]'
                    }`}
                  >
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                      <p className="text-sm" style={{ color: '#666' }}>
                        {isCompressingImage ? 'Compressing image...' : imagePreview ? 'Change image' : 'Upload community image'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>
                        PNG, JPG - Max 10MB (will be compressed to max 500KB)
                      </p>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {hasError('image') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('image')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Status</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4"
                        style={{ accentColor: '#C12D32' }}
                      />
                    )}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>
                    Public Community
                  </span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4"
                        style={{ accentColor: '#C12D32' }}
                      />
                    )}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>
                    Featured Community
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C12D32' }}
              >
                {isLoading
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Community'
                  : 'Create Community'}
              </button>
              <button
                type="button"
                onClick={() => (isEditMode ? navigate(-1) : navigate('/communities'))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
