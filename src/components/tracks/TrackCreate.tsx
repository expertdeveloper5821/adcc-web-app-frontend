import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Activity, Shield, Image as ImageIcon, Settings, Save, Globe } from 'lucide-react';
import { addTrack, Track, availableFacilities } from '../../data/tracksData';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRole } from '../../App';
import { createTrack, type CreateTrackRequest, type FacilityType, FACILITY_KEY_TO_API } from '../../services/trackService';
import { useForm, Controller } from 'react-hook-form';
import { compressImage } from '../../utils/imageUtils';
import { useLocale } from '../../contexts/LocaleContext';


interface TrackCreateProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

type FormData = {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  trackType: 'road' | 'circuit' | 'coastal' | 'desert' | 'urban';
  country: string;
  city: string;
  area: string;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  surfaceType: 'asphalt' | 'concrete' | 'mixed';
  elevationGain: number;
  estimatedTime: string;
  loopOptions: number[];
  facilities: string[];
  safetyNotes: string;
  helmetRequired: boolean;
  nightRidingAllowed: boolean;
  status: 'open' | 'limited' | 'closed' | 'archived';
  visibility: 'public' | 'hidden';
  displayPriority: number;
  loopOptionInput: string;
};

const formFields = [
  // Basic Information
  { section: 1, name: 'name', label: 'Track Name', type: 'text', required: true, placeholder: 'Yas Marina Circuit' },
  { section: 1, name: 'slug', label: 'Slug (auto-generated)', type: 'text', readOnly: true },
  { section: 1, name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the track...' },
  { section: 1, name: 'trackType', label: 'Track Type', type: 'select', required: true, options: ['road', 'circuit', 'coastal', 'desert', 'urban'] },
  { section: 1, name: 'country', label: 'Country', type: 'select', required: true, options: ['UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman', 'Qatar'] },
  { section: 1, name: 'city', label: 'City', type: 'select', required: true, options: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'] },
  { section: 1, name: 'area', label: 'Area (optional)', type: 'text', placeholder: 'e.g., Yas Island...' },
  // Route Details
  { section: 2, name: 'distance', label: 'Total Distance (km)', type: 'number', required: true, min: 0.1, step: 0.1 },
  { section: 2, name: 'difficulty', label: 'Difficulty', type: 'select', required: true, options: ['easy', 'medium', 'hard'] },
  { section: 2, name: 'surfaceType', label: 'Surface Type', type: 'select', required: true, options: ['asphalt', 'concrete', 'mixed'] },
  { section: 2, name: 'elevationGain', label: 'Elevation Gain (m)', type: 'number', min: 0 },
  { section: 2, name: 'estimatedTime', label: 'Estimated Ride Time', type: 'text', placeholder: 'e.g., 2-3 hours' },
  // Safety
  { section: 4, name: 'safetyNotes', label: 'Safety Notes', type: 'textarea', placeholder: 'Important safety information...' },
  { section: 4, name: 'helmetRequired', label: 'Helmet Required', type: 'checkbox' },
  { section: 4, name: 'nightRidingAllowed', label: 'Night Riding Allowed', type: 'checkbox' },
  // Status
  { section: 6, name: 'status', label: 'Track Status', type: 'select', options: ['open', 'limited', 'closed', 'archived'] },
  { section: 6, name: 'visibility', label: 'Visibility', type: 'select', options: ['public', 'hidden'] },
  { section: 6, name: 'displayPriority', label: 'Display Priority', type: 'number', min: 0 },
];

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function TrackCreate({ role }: TrackCreateProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const { locale } = useLocale();


  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      
      descriptionAr: '',
      trackType: 'road',
      country: 'UAE',
      city: 'Abu Dhabi',
      area: '',
      distance: 10,
      difficulty: 'easy',
      surfaceType: 'asphalt',
      elevationGain: 0,
      estimatedTime: '',
      loopOptions: [],
      facilities: [],
      safetyNotes: '',
      helmetRequired: true,
      nightRidingAllowed: false,
      status: 'open',
      visibility: 'public',
      displayPriority: 5,
      loopOptionInput: '',
    }
  });

  const watchedName = watch('name');
  const watchedLoopOptions = watch('loopOptions');
  const watchedFacilities = watch('facilities');
  const watchedLoopOptionInput = watch('loopOptionInput');

  useEffect(() => {
    if (watchedName) {
    const slug = watchedName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

    setValue('slug', slug);
  } 
},[watchedName, setValue]);

  const toggleFacility = (facility: string) => {
    const current = watchedFacilities;
    const newFacilities = current.includes(facility)
      ? current.filter(f => f !== facility)
      : [...current, facility];
    setValue('facilities', newFacilities);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    setThumbnailUrl(''); // URL set after upload; for now just preview
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    setCoverImageUrl('');
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type));
    if (valid.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...valid]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);
    setGalleryImageUrls((prev) => prev); // URLs after upload
    e.target.value = '';
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addLoopOption = () => {
    const value = parseFloat(watchedLoopOptionInput);
    if (value > 0 && !watchedLoopOptions.includes(value)) {
      setValue('loopOptions', [...watchedLoopOptions, value].sort((a, b) => a - b));
      setValue('loopOptionInput', '');
    }
  };

  const removeLoopOption = (value: number) => {
    setValue('loopOptions', watchedLoopOptions.filter(o => o !== value));
  };

const onSubmit = async (data: FormData, action: 'draft' | 'publish') => {
  try {
    setLoading(true);

    // Extra validation (react-hook-form already handles required)
    if (!data.loopOptions.length) {
      toast.error('Please add at least one loop option');
      setLoading(false);
      return;
    }

    // Convert selected image files to base64 so backend can store them
    let thumbnailBase64 = thumbnailUrl;
    let coverBase64 = coverImageUrl;
    let galleryBase64 = [...galleryImageUrls];

    if (thumbnailFile) {
      try {
        thumbnailBase64 = await compressImage(thumbnailFile, 400, 300, 0.75);
      } catch (e) {
        console.error('Thumbnail compress error:', e);
        toast.error('Failed to process thumbnail image');
        setLoading(false);
        return;
      }
    }
    if (coverFile) {
      try {
        coverBase64 = await compressImage(coverFile, 1200, 600, 0.75);
      } catch (e) {
        console.error('Cover image compress error:', e);
        toast.error('Failed to process cover image');
        setLoading(false);
        return;
      }
    }
    if (galleryFiles.length > 0) {
      try {
        galleryBase64 = await Promise.all(
          galleryFiles.map((file) => compressImage(file, 800, 600, 0.7))
        );
      } catch (e) {
        console.error('Gallery images compress error:', e);
        toast.error('Failed to process gallery images');
        setLoading(false);
        return;
      }
    }

    // Map form facility keys to API FacilityType (e.g. bike_rental -> bikeRental); backend expects flat array
    const facilitiesMapped: FacilityType[] = (data.facilities || [])
      .map((key) => FACILITY_KEY_TO_API[key] ?? key)
      .filter((v): v is FacilityType => Boolean(v));

    const payload: CreateTrackRequest = {
      title: data.name.trim(),
      slug: data.slug || undefined,
      description: data.description.trim(),
      ...(data.nameAr?.trim() ? { titleAr: data.nameAr.trim() } : {}),
      ...(data.descriptionAr?.trim() ? { descriptionAr: data.descriptionAr.trim() } : {}),
      trackType: data.trackType === 'coastal' ? 'costal' : data.trackType,
      country: data.country,
      city: data.city,
      area: data.area || undefined,
      distance: Number(data.distance),
      difficulty: data.difficulty,
      surfaceType: data.surfaceType,
      elevation: String(data.elevationGain ?? 0),
      estimatedTime: data.estimatedTime || undefined,
      loopOptions: data.loopOptions,
      facilities: facilitiesMapped.length ? facilitiesMapped : undefined,
      safetyNotes: data.safetyNotes || undefined,
      helmetRequired: data.helmetRequired,
      nightRidingAllowed: data.nightRidingAllowed,
      status: action === 'draft' ? 'closed' : data.status,
      visibility: data.visibility,
      displayPriority: data.displayPriority,
      galleryImages: galleryBase64,
      image: thumbnailBase64 || undefined,
      coverImage: coverBase64 || undefined,
    };

    const track = await createTrack(payload);

    if (response && (response.success !== false)) {
      toast.success((response as any).message || 'Track created successfully');
      navigate('/tracks');
    } else {
      toast.error((response as any)?.message || 'Failed to create track');
    }

  } catch (error: any) {
    console.error('Create Track Error:', error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong while creating track';
    toast.error(typeof message === 'string' ? message : 'Failed to create track');
  } finally {
    setLoading(false);
  }
};

  const cities = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'];

  const renderField = (field: any) => {
    const { name, label, type, required, placeholder, options, min, step, readOnly } = field;
    return (
      <div key={name}>
        <label className="block text-sm mb-2" style={{ color: '#666' }}>
          {label} {required && '*'}
        </label>
        <Controller
          name={name as keyof FormData}
          control={control}
          rules={{ required: required ? `${label} is required` : false, min: min ? { value: min, message: `Minimum value is ${min}` } : undefined }}
          render={({ field: { onChange, value } }) => {
            if (type === 'text' || type === 'number') {
              const inputValue = value === undefined || value === null ? '' : String(value);
              return (
                <input
                  type={type}
                  value={inputValue}
                  onChange={onChange}
                  placeholder={placeholder}
                  min={min}
                  step={step}
                  readOnly={readOnly}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              );
            }
            if (type === 'textarea') {
              const textValue = value === undefined || value === null ? '' : String(value);
              return (
                <textarea
                  value={textValue}
                  onChange={onChange}
                  placeholder={placeholder}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              );
            }
            if (type === 'select') {
              const selectValue = value === undefined || value === null ? '' : String(value);
              return (
                <select
                  value={selectValue}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              );
            }
            if (type === 'checkbox') {
              return (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>{label}</span>
                </label>
              );
            }
            return null;
          }}
        />
        {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tracks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Track</h1>
          <p style={{ color: '#666' }}>Add a new cycling track to the system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1 - Basic Information */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl" style={{ color: '#333' }}>1. Basic Information</h2>
              </div>

            </div>

            {/* English Fields */}
            <div className="space-y-4" style={{ display: locale === 'en' ? 'block' : 'none' }}>
              {formFields.filter(f => f.section === 1 && ['name', 'slug', 'description'].includes(f.name)).map(renderField)}
            </div>

            {/* Arabic Fields */}
            <div className="space-y-4" style={{ display: locale === 'ar' ? 'block' : 'none' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  اسم المسار <span className="text-gray-400">(Track Name)</span>
                </label>
                <Controller
                  name="nameAr"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="text"
                      value={value || ''}
                      onChange={onChange}
                      dir="rtl"
                      lang="ar"
                      placeholder="حلبة مرسى ياس"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                      style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>
                  الوصف <span className="text-gray-400">(Description)</span>
                </label>
                <Controller
                  name="descriptionAr"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <textarea
                      value={value || ''}
                      onChange={onChange}
                      dir="rtl"
                      lang="ar"
                      rows={4}
                      placeholder="وصف المسار..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                      style={{ fontFamily: "'Noto Sans Arabic', 'Segoe UI', sans-serif" }}
                    />
                  )}
                />
              </div>

              {/* English reference */}
              {watch('name') && (
                <div className="p-3 rounded-lg border" style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                    <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>English reference</span>
                  </div>
                  <p className="text-sm" style={{ color: '#1E40AF' }}>{watch('name')}</p>
                  {watch('description') && (
                    <p className="text-xs mt-1" style={{ color: '#60A5FA' }}>{watch('description')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Common fields always visible */}
            <div className="space-y-4 mt-4">
              {formFields.filter(f => f.section === 1 && !['name', 'slug', 'description'].includes(f.name)).map(renderField)}
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
              {formFields.filter(f => f.section === 2).map(renderField)}

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Loop Options (km)</label>
                <div className="flex gap-2 mb-2">
                  <Controller
                    name="loopOptionInput"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="e.g., 8, 15, 22, 35"
                        min="0.1"
                        step="0.1"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                        onKeyPress={(e) => e.key === 'Enter' && addLoopOption()}
                      />
                    )}
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
                  {watchedLoopOptions.map(option => (
                    <span
                      key={option}
                      className="px-3 py-1 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      {option} km
                      <button
                        type="button"
                        onClick={() => removeLoopOption(option)}
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFacilities.map(facility => (
                <label
                  key={facility.key}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={watchedFacilities.includes(facility.key)}
                    onChange={() => toggleFacility(facility.key)}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#333' }}>{facility.label}</span>
                </label>
              ))}
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
              {formFields.filter(f => f.section === 4 && f.type !== 'checkbox').map(renderField)}

              <div className="space-y-3">
                {formFields.filter(f => f.section === 4 && f.type === 'checkbox').map(renderField)}
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track Thumbnail Image *</label>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="track-thumbnail"
                />
                <label
                  htmlFor="track-thumbnail"
                  className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-40 mx-auto rounded object-cover" />
                      <span className="text-xs mt-1 block" style={{ color: '#666' }}>{thumbnailFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Upload thumbnail (400x300)</p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 4:3 format recommended</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image *</label>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleCoverChange}
                  className="hidden"
                  id="track-cover"
                />
                <label
                  htmlFor="track-cover"
                  className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  {coverPreview ? (
                    <div className="relative inline-block">
                      <img src={coverPreview} alt="Cover preview" className="max-h-40 mx-auto rounded object-cover" />
                      <span className="text-xs mt-1 block" style={{ color: '#666' }}>{coverFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                      <p className="text-sm" style={{ color: '#666' }}>Upload cover image (1200x600)</p>
                      <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 2:1 format recommended</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Gallery Images (multiple)</label>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleGalleryChange}
                  className="hidden"
                  id="track-gallery"
                  multiple
                />
                <label
                  htmlFor="track-gallery"
                  className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload gallery images</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Multiple files accepted</p>
                </label>
                {galleryPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {galleryPreviews.map((src, index) => (
                      <div key={index} className="relative">
                        <img src={src} alt={`Gallery ${index + 1}`} className="h-20 w-20 rounded object-cover border" />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-none"
                        >
                          ×
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
              {formFields.filter(f => f.section === 6).map((field) => (
                <div key={field.name}>
                  {renderField(field)}
                  {field.name === 'displayPriority' && (
                    <p className="text-xs mt-1" style={{ color: '#999' }}>Higher numbers appear first</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7 - Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>7. Actions</h3>

            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'publish'))}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              {/* <Save className="w-5 h-5" />
              Publish Track */}
              {loading ? 'Publishing...' : 'Publish Track'}
            </button>

            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => navigate('tracks')}
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

};

export default TrackCreate;