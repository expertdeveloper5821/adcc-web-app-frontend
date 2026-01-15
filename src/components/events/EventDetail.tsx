import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Copy, XCircle, Send, Eye, Users, Star, Share2, Calendar, MapPin, Clock, Download, Upload, FileText, Image as ImageIcon, Save, X } from 'lucide-react';
import { UserRole } from '../../App';
import { toast } from 'sonner';
import { getEventById, updateEvent as updateEventApi, EventApiResponse } from '../../services/eventsApi';

interface EventDetailProps {
  eventId: string;
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

type TabType = 'overview' | 'registrations' | 'media' | 'ratings' | 'notifications';

export function EventDetail({ eventId, navigate, role }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (isEditing && event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        mainImage: event.mainImage || '',
        eventImage: event.eventImage || '',
        eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
        eventTime: event.eventTime || '',
        address: event.address || '',
        maxParticipants: event.maxParticipants || 500,
        minAge: event.minAge || 16,
        maxAge: event.maxAge || 70,
        youtubeLink: event.youtubeLink || '',
      });
    }
  }, [isEditing, event]);

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const fetchedEvent = await getEventById(eventId);
      setEvent(fetchedEvent);
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Event not found</div>;
  }

  const canEdit = role === 'super-admin' || role === 'content-manager' || role === 'community-manager';

  const registrations = [
    { id: '1', name: 'Ahmed Al Mansoori', email: 'ahmed@example.com', phone: '+971501234567', registeredAt: '2026-01-10' },
    { id: '2', name: 'Sara Ali', email: 'sara@example.com', phone: '+971501234568', registeredAt: '2026-01-10' },
    { id: '3', name: 'Mohammed Hassan', email: 'mohammed@example.com', phone: '+971501234569', registeredAt: '2026-01-09' },
  ];

  const ratings = [
    { id: '1', user: 'Ahmed Al Mansoori', rating: 5, comment: 'Excellent event! Well organized and great track.', date: '2026-01-08' },
    { id: '2', user: 'Sara Ali', rating: 5, comment: 'Loved the morning ride. Perfect weather and friendly group.', date: '2026-01-07' },
    { id: '3', user: 'Omar Khalid', rating: 4, comment: 'Good event, would have liked more water stations.', date: '2026-01-07' },
  ];

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this event?')) {
      setIsSaving(true);
      try {
        await updateEventApi(eventId, { status: 'cancelled' });
        toast.success('Event cancelled successfully');
        loadEvent(); // Reload event to reflect changes
      } catch (error: any) {
        console.error('Error cancelling event:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel event. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDuplicate = () => {
    toast.success('Event duplicated successfully');
    navigate('events');
  };

  const handleSendPush = () => {
    toast.success('Push notification sent to all registrants');
  };

  const handleImageUpload = (field: 'mainImage' | 'eventImage', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, [field]: base64String });
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
      setIsEditing(false);
      loadEvent(); // Reload event to reflect changes
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original event data
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        mainImage: event.mainImage || '',
        eventImage: event.eventImage || '',
        eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
        eventTime: event.eventTime || '',
        address: event.address || '',
        maxParticipants: event.maxParticipants || 500,
        minAge: event.minAge || 16,
        maxAge: event.maxAge || 70,
        youtubeLink: event.youtubeLink || '',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{event.title}</h1>
          <p style={{ color: '#666' }}>{event.description?.substring(0, 100)}...</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['overview', 'registrations', 'media', 'ratings', 'notifications'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize transition-all"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <>
          {isEditing ? (
            // Edit Form
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
                    onClick={handleCancelEdit}
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
          ) : (
            // View Mode
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {event.mainImage && (
              <div className="rounded-2xl overflow-hidden">
                <img src={event.mainImage} alt={event.title} className="w-full h-80 object-cover" />
              </div>
            )}

            {/* Event Info */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} />
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Date & Time</div>
                    {event.eventDate && (
                      <div className="text-sm" style={{ color: '#333' }}>
                        {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                    {event.eventTime && (
                      <div className="text-sm" style={{ color: '#333' }}>
                        {event.eventTime}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} />
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Location</div>
                    <div className="text-sm" style={{ color: '#333' }}>{event.address}</div>
                  </div>
                </div>

                {event.youtubeLink && (
                  <div className="flex items-start gap-3">
                    <div className="text-sm mb-1" style={{ color: '#666' }}>YouTube Link</div>
                    <a href={event.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {event.youtubeLink}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm mb-2" style={{ color: '#666' }}>Description</div>
                  <p className="text-sm" style={{ color: '#333' }}>{event.description}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#E1C06E' }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#333' }} />
                <div className="text-2xl mb-1" style={{ color: '#333' }}>{event.maxParticipants}</div>
                <div className="text-xs" style={{ color: '#666' }}>Max Participants</div>
              </div>
              {event.minAge && event.maxAge && (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#ECC180' }}>
                  <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#333' }} />
                  <div className="text-2xl mb-1" style={{ color: '#333' }}>{event.minAge}-{event.maxAge}</div>
                  <div className="text-xs" style={{ color: '#666' }}>Age Range</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {canEdit && (
              <div className="p-6 rounded-2xl shadow-sm bg-white">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Event</span>
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#E1C06E', color: '#333' }}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={handleSendPush}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                    style={{ backgroundColor: '#CF9F0C' }}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Push</span>
                  </button>
                  {(event.status !== 'cancelled' && event.status !== 'Cancelled') && (
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isSaving ? 'Cancelling...' : 'Cancel Event'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Event Status */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Status</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white capitalize"
                    style={{
                      backgroundColor:
                        event.status === 'upcoming' || event.status === 'Published' ? '#CF9F0C' :
                        event.status === 'ongoing' ? '#CF9F0C' :
                        event.status === 'completed' ? '#999' :
                        event.status === 'cancelled' || event.status === 'Cancelled' ? '#C12D32' : '#999'
                    }}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Max Participants</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.maxParticipants}</span>
                </div>
                {event.minAge && event.maxAge && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#666' }}>Age Range</span>
                    <span className="text-sm" style={{ color: '#333' }}>{event.minAge} - {event.maxAge}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          )}
        </>
      )}

      {activeTab === 'registrations' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ color: '#333' }}>Registrations</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Name</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Email</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Phone</th>
                  <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{reg.name}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{reg.email}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{reg.phone}</td>
                    <td className="py-3 px-2 text-sm" style={{ color: '#666' }}>
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Event Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {event.mainImage && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img src={event.mainImage} alt="Event Main" className="w-full h-full object-cover" />
              </div>
            )}
            {event.eventImage && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img src={event.eventImage} alt="Event" className="w-full h-full object-cover" />
              </div>
            )}
            {canEdit && (
              <div
                className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#ECC180' }}
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload Media</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ color: '#333' }}>Ratings & Reviews</h2>
          </div>

          <div className="text-center py-8" style={{ color: '#666' }}>
            No ratings available yet
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Send Notification</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Title</label>
              <input
                type="text"
                placeholder="Notification title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message</label>
              <textarea
                placeholder="Notification message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Recipients</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              >
                <option>All Registrants</option>
                <option>All Members</option>
                <option>Custom List</option>
              </select>
            </div>

            <button
              onClick={handleSendPush}
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              Send Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}