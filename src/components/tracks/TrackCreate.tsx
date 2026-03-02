import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Activity, Shield, Image as ImageIcon, Settings, Save } from 'lucide-react';
import { addTrack, Track, availableFacilities } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRole } from '../../App';
import { createTrack } from '../../services/trackService';
import { useForm, Controller } from 'react-hook-form';


interface TrackCreateProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}




type FormData = {
  name: string;
  slug: string;
  description: string;
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

export function TrackCreate({ role }: TrackCreateProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
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
      return;
    }

    const payload = {
      title: data.name.trim(),
      slug: data.slug,
      description: data.description.trim(),
      trackType: data.trackType,
      country: data.country,
      city: data.city,
      area: data.area,
      distance: Number(data.distance),
      difficulty: data.difficulty,
      surfaceType: data.surfaceType,
      elevation: data.elevationGain || 0,
      estimatedTime: data.estimatedTime,
      loopOptions: data.loopOptions,
      facilities: data.facilities,
      safetyNotes: data.safetyNotes,
      helmetRequired: data.helmetRequired,
      nightRidingAllowed: data.nightRidingAllowed,
      status: action === 'draft' ? 'Closed' : data.status,
      visibility: data.visibility,
      displayPriority: data.displayPriority,
      // avgtime: data.avgtime,
    };

    const response = await createTrack(payload);

    if (response?.success) {
      toast.success(response.message || 'Track created successfully');

      // optional redirect
      navigate('/tracks');
    } else {
      toast.error(response?.message || 'Failed to create track');
    }

  } catch (error: any) {
    console.error('Create Track Error:', error);

    toast.error(
      error?.response?.data?.message ||
      'Something went wrong while creating track'
    );
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
              return (
                <input
                  type={type}
                  value={value || ''}
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
              return (
                <textarea
                  value={value || ''}
                  onChange={onChange}
                  placeholder={placeholder}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              );
            }
            if (type === 'select') {
              return (
                <select
                  value={value || ''}
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
                    checked={value || false}
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
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>1. Basic Information</h2>
            </div>

            <div className="space-y-4">
              {formFields.filter(f => f.section === 1).map(renderField)}
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
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload thumbnail (400x300)</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 4:3 format recommended</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image *</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload cover image (1200x600)</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - 2:1 format recommended</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Gallery Images (multiple)</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload gallery images</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Multiple files accepted</p>
                </div>
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