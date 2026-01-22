import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, Activity, Shield } from 'lucide-react';
import { addTrack, Track } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';

export function TrackCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    city: 'Abu Dhabi',
    area: '',
    shortDescription: '',
    distance: 10,
    elevation: 0,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    surfaceType: 'Road' as 'Road' | 'Mixed' | 'Off-road',
    hasLighting: false,
    trafficLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    safetyLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    helmetRequired: true,
    nightRidingAllowed: false,
    safetyNotes: '',
  });

  const handleSubmit = (status: 'Active' | 'Draft') => {
    if (!formData.name || !formData.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTrack: Track = {
      id: Date.now().toString(),
      ...formData,
      eventsCount: 0,
      status,
      image: 'https://images.unsplash.com/photo-1553547358-e8a4ee2dcfeb?w=800',
      mapPreview: 'https://images.unsplash.com/photo-1757860150436-faf5d20b8893?w=400',
      createdAt: new Date().toISOString(),
    };

    addTrack(newTrack);
    toast.success(`Track ${status === 'Active' ? 'published' : 'saved as draft'} successfully`);
    navigate(`/tracks/${newTrack.id}`);
  };

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
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Track</h1>
          <p style={{ color: '#666' }}>Add a new cycling track</p>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Al Wathba Circuit"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  >
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Al Ain">Al Ain</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Area / Zone *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g., Corniche"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  />
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
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Elevation (m)</label>
                  <input
                    type="number"
                    value={formData.elevation}
                    onChange={(e) => setFormData({ ...formData, elevation: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  />
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
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              Publish Track
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => navigate('/tracks')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
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
