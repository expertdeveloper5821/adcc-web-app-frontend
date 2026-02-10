import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, Activity, Shield } from 'lucide-react';
import { updateTrack, Track, getTrack } from '../../data/tracksData';
import { toast } from 'sonner';

export function TrackEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Track | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load track data on component mount
  useEffect(() => {
    if (id) {
      const track = getTrack(id);
      if (track) {
        setFormData(track);
        setIsLoading(false);
      } else {
        toast.error('✗ Track not found');
        setTimeout(() => navigate('/tracks'), 1000);
      }
    }
  }, [id, navigate]);

  // Validation function
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: { [key: string]: string } = {};

    // Required field validations
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Track name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Track name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Track name must not exceed 100 characters';
    }

    if (!formData.area || formData.area.trim() === '') {
      newErrors.area = 'Area/Zone is required';
    } else if (formData.area.length < 2) {
      newErrors.area = 'Area must be at least 2 characters';
    }

    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
    }

    if (formData.distance <= 0) {
      newErrors.distance = 'Distance must be greater than 0';
    } else if (formData.distance > 500) {
      newErrors.distance = 'Distance must not exceed 500 km';
    }

    if (formData.elevation < 0) {
      newErrors.elevation = 'Elevation cannot be negative';
    } else if (formData.elevation > 10000) {
      newErrors.elevation = 'Elevation must not exceed 10,000 meters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'Active' | 'Draft') => {
    if (!formData) return;

    // Validate form
    if (!validateForm()) {
      toast.error('✗ Please check the highlighted fields and try again');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedTrack: Track = {
        ...formData,
        status,
      };

      updateTrack(formData.id, updatedTrack);

      // Success message based on status
      if (status === 'Active') {
        toast.success('✓ Track updated and published successfully!');
      } else {
        toast.success('✓ Track saved as draft successfully!');
      }

      // Navigate to track detail after short delay
      setTimeout(() => {
        navigate(`/tracks/${formData.id}`);
      }, 500);
    } catch (error) {
      console.error('Error updating track:', error);
      toast.error('✗ Failed to update track. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#C12D32' }}></div>
          <p className="mt-4" style={{ color: '#666' }}>Loading track...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p style={{ color: '#666' }}>Track not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tracks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Edit Track</h1>
          <p style={{ color: '#666' }}>Update track information and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g., Al Wathba Circuit"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  style={{ focusRing: errors.name ? '#DC2626' : '#C12D32' }}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.city ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusRing: errors.city ? '#DC2626' : '#C12D32' }}
                  >
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Al Ain">Al Ain</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Area / Zone *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => {
                      setFormData({ ...formData, area: e.target.value });
                      if (errors.area) setErrors({ ...errors, area: '' });
                    }}
                    placeholder="e.g., Corniche"
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.area ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusRing: errors.area ? '#DC2626' : '#C12D32' }}
                  />
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description of the track"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Track Details */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Track Details</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Distance (km)</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => {
                      setFormData({ ...formData, distance: parseFloat(e.target.value) });
                      if (errors.distance) setErrors({ ...errors, distance: '' });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.distance ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusRing: errors.distance ? '#DC2626' : '#C12D32' }}
                  />
                  {errors.distance && <p className="text-red-500 text-xs mt-1">{errors.distance}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Elevation (m)</label>
                  <input
                    type="number"
                    value={formData.elevation}
                    onChange={(e) => {
                      setFormData({ ...formData, elevation: parseFloat(e.target.value) });
                      if (errors.elevation) setErrors({ ...errors, elevation: '' });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.elevation ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusRing: errors.elevation ? '#DC2626' : '#C12D32' }}
                  />
                  {errors.elevation && <p className="text-red-500 text-xs mt-1">{errors.elevation}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Difficulty Level</label>
                <div className="flex gap-3">
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                    <label key={level} className="flex-1">
                      <input
                        type="radio"
                        name="difficulty"
                        checked={formData.difficulty === level}
                        onChange={() => setFormData({ ...formData, difficulty: level })}
                        className="sr-only"
                      />
                      <div
                        className="px-4 py-2 rounded-lg text-center cursor-pointer transition-all"
                        style={{
                          backgroundColor: formData.difficulty === level ? '#C12D32' : '#ECC180',
                          color: formData.difficulty === level ? '#fff' : '#333',
                        }}
                      >
                        {level}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Surface Type</label>
                <select
                  value={formData.surfaceType}
                  onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                >
                  <option value="Road">Road</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Off-road">Off-road</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasLighting}
                    onChange={(e) => setFormData({ ...formData, hasLighting: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C12D32' }}
                  />
                  <span className="text-sm" style={{ color: '#666' }}>Lighting Available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>Map Location</h2>

            <div className="space-y-4">
              <div
                className="w-full h-64 rounded-lg border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: '#ECC180', backgroundColor: '#FFF9EF' }}
              >
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Map preview will appear here</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>Click to add map pin coordinates</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Upload GPX File (Optional)</label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload GPX route file</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Safety Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Traffic Level</label>
                <select
                  value={formData.trafficLevel}
                  onChange={(e) => setFormData({ ...formData, trafficLevel: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-2">
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

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Safety Notes</label>
                <textarea
                  value={formData.safetyNotes}
                  onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                  placeholder="Additional safety information..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>Media</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Click to upload or drag and drop</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={() => handleSubmit('Active')}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: '#C12D32' }}
            >
              {isSubmitting ? 'Updating...' : 'Update & Publish'}
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => navigate('/tracks')}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>

          {/* Safety Level Selector */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Safety Level</h3>
            <div className="space-y-2">
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <label key={level} className="block">
                  <input
                    type="radio"
                    name="safetyLevel"
                    checked={formData.safetyLevel === level}
                    onChange={() => setFormData({ ...formData, safetyLevel: level })}
                    className="sr-only"
                  />
                  <div
                    className="px-4 py-2 rounded-lg cursor-pointer transition-all"
                    style={{
                      backgroundColor: formData.safetyLevel === level ? '#C12D32' : '#ECC180',
                      color: formData.safetyLevel === level ? '#fff' : '#333',
                    }}
                  >
                    {level}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

