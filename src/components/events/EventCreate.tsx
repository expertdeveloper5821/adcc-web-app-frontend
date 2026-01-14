import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, MapPin, Clock, Users, Image as ImageIcon, FileText } from 'lucide-react';
import { addEvent, Event } from '../../data/eventsData';
import { toast } from 'sonner@2.0.3';

interface EventCreateProps {
  navigate: (page: string, params?: any) => void;
}

export function EventCreate({ navigate }: EventCreateProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    fullDescription: '',
    city: 'Abu Dhabi',
    track: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 100,
    featured: false,
    allowRating: true,
    allowSharing: true,
    registrationOpen: true,
  });

  const handleSubmit = (status: 'Draft' | 'Published') => {
    if (!formData.name || !formData.date || !formData.track) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
      registrations: 0,
      rating: 0,
      status,
      image: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwZ3JvdXAlMjByb2FkfGVufDF8fHx8MTc2ODEzNjQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
      views: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    addEvent(newEvent);
    toast.success(`Event ${status === 'Published' ? 'published' : 'saved as draft'} successfully`);
    navigate('event-detail', { selectedEventId: newEvent.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Event</h1>
          <p style={{ color: '#666' }}>Set up a new cycling event</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Event Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Title *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Al Wathba Morning Ride"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for event cards"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Full Description</label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed event description"
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>City</label>
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Track *</label>
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                >
                  <option value="">Select track</option>
                  <option value="Al Wathba Circuit">Al Wathba Circuit</option>
                  <option value="Yas Marina Circuit">Yas Marina Circuit</option>
                  <option value="Corniche Road">Corniche Road</option>
                  <option value="Desert Route 1">Desert Route 1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Media</h2>
            </div>

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

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Gallery Images</label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload multiple images</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Registration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.registrationOpen}
                  onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Registration Open</span>
              </label>
            </div>
          </div>

          {/* Visibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>Visibility</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Featured Event</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowRating}
                  onChange={(e) => setFormData({ ...formData, allowRating: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Allow Rating</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowSharing}
                  onChange={(e) => setFormData({ ...formData, allowSharing: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Allow Sharing</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={() => handleSubmit('Published')}
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              Publish Event
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => navigate('events')}
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
}
