import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, MapPin, Image as ImageIcon, Users, Save, X } from 'lucide-react';
import { UserRole } from '../../App';
import { toast } from 'sonner';
import { getEventById, updateEvent as updateEventApi, EventApiResponse } from '../../services/eventsApi';

interface EventEditProps {
  role: UserRole;
}

export function EventEdit({ role }: EventEditProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id || '';
  const [event, setEvent] = useState<EventApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainImage: '',
    eventImage: '',
    eventDate: '',
    eventTime: '',
    address: '',
    maxParticipants: 500,
    minAge: 16,
    maxAge: 70,
    youtubeLink: '',
  });

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const fetchedEvent = await getEventById(eventId);
      setEvent(fetchedEvent);
      setFormData({
        title: fetchedEvent.title || '',
        description: fetchedEvent.description || '',
        mainImage: fetchedEvent.mainImage || '',
        eventImage: fetchedEvent.eventImage || '',
        eventDate: fetchedEvent.eventDate ? fetchedEvent.eventDate.split('T')[0] : '',
        eventTime: fetchedEvent.eventTime || '',
        address: fetchedEvent.address || '',
        maxParticipants: fetchedEvent.maxParticipants || 500,
        minAge: fetchedEvent.minAge || 16,
        maxAge: fetchedEvent.maxAge || 70,
        youtubeLink: fetchedEvent.youtubeLink || '',
      });
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const handleImageUpload = (field: 'mainImage' | 'eventImage', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, [field]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.eventDate || !formData.address) {
      toast.error('Please fill in all required fields (Title, Date, Address)');
      return;
    }

    setIsSaving(true);
    try {
      const eventData: Partial<EventApiResponse> = {
        title: formData.title,
        description: formData.description,
        mainImage: formData.mainImage || undefined,
        eventImage: formData.eventImage || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        address: formData.address,
        maxParticipants: formData.maxParticipants,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        youtubeLink: formData.youtubeLink || undefined,
      };

      await updateEventApi(eventId, eventData);
      toast.success('Event updated successfully');
      navigate(`/events/${eventId}`);
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Event not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to event detail"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Edit Event</h1>
          <p style={{ color: '#666' }}>{event.title}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Abu Dhabi Cycling Challenge 2025"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event description"
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>YouTube Link</label>
                <input
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Time *</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
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

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., Yas Marina Circuit, Abu Dhabi"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              />
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Main Image (Base64)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('mainImage', file);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
                {formData.mainImage && (
                  <div className="mt-2">
                    <img src={formData.mainImage} alt="Main" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Image (Base64)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('eventImage', file);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
                {formData.eventImage && (
                  <div className="mt-2">
                    <img src={formData.eventImage} alt="Event" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
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
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 500 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Min Age</label>
                <input
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 16 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Age</label>
                <input
                  type="number"
                  value={formData.maxAge}
                  onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-50"
              style={{ color: '#666' }}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
