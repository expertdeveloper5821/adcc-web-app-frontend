import React, { useState } from 'react';
import { ArrowLeft, Edit, Copy, XCircle, Send, Eye, Users, Star, Share2, Calendar, MapPin, Clock, Download, Upload } from 'lucide-react';
import { UserRole } from '../../App';
import { getEvent, updateEvent } from '../../data/eventsData';
import { toast } from 'sonner@2.0.3';

interface EventDetailProps {
  eventId: string;
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

type TabType = 'overview' | 'registrations' | 'media' | 'ratings' | 'notifications';

export function EventDetail({ eventId, navigate, role }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const event = getEvent(eventId);

  if (!event) {
    return <div>Event not found</div>;
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

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this event?')) {
      updateEvent(eventId, { status: 'Cancelled' });
      toast.success('Event cancelled successfully');
    }
  };

  const handleDuplicate = () => {
    toast.success('Event duplicated successfully');
    navigate('events');
  };

  const handleSendPush = () => {
    toast.success('Push notification sent to all registrants');
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
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{event.name}</h1>
          <p style={{ color: '#666' }}>{event.shortDescription}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden">
              <img src={event.image} alt={event.name} className="w-full h-80 object-cover" />
            </div>

            {/* Event Info */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} />
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Date & Time</div>
                    <div className="text-sm" style={{ color: '#333' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm" style={{ color: '#333' }}>
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} />
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Location</div>
                    <div className="text-sm" style={{ color: '#333' }}>{event.track}</div>
                    <div className="text-sm" style={{ color: '#333' }}>{event.city}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm mb-2" style={{ color: '#666' }}>Description</div>
                  <p className="text-sm" style={{ color: '#333' }}>{event.fullDescription}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#ECC180' }}>
                <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: '#333' }} />
                <div className="text-2xl mb-1" style={{ color: '#333' }}>{event.views.toLocaleString()}</div>
                <div className="text-xs" style={{ color: '#666' }}>Views</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#E1C06E' }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#333' }} />
                <div className="text-2xl mb-1" style={{ color: '#333' }}>{event.registrations}</div>
                <div className="text-xs" style={{ color: '#666' }}>Registrations</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#CF9F0C', color: '#fff' }}>
                <Star className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl mb-1">{event.rating}</div>
                <div className="text-xs opacity-90">Rating</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#ECC180' }}>
                <Share2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#333' }} />
                <div className="text-2xl mb-1" style={{ color: '#333' }}>{event.shares}</div>
                <div className="text-xs" style={{ color: '#666' }}>Shares</div>
              </div>
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
                  {event.status !== 'Cancelled' && (
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Event</span>
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
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{
                      backgroundColor:
                        event.status === 'Published' ? '#CF9F0C' :
                        event.status === 'Draft' ? '#999' : '#C12D32'
                    }}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Featured</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.featured ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Registration</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.registrationOpen ? 'Open' : 'Closed'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Capacity</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.registrations}/{event.capacity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ color: '#333' }}>Registrations ({event.registrations})</h2>
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
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={event.image} alt="Event" className="w-full h-full object-cover" />
            </div>
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
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 fill-current" style={{ color: '#CF9F0C' }} />
              <span className="text-2xl" style={{ color: '#333' }}>{event.rating}</span>
            </div>
          </div>

          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#333' }}>{rating.user}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(rating.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#CF9F0C' }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: '#666' }}>{rating.comment}</p>
                <p className="text-xs" style={{ color: '#999' }}>
                  {new Date(rating.date).toLocaleDateString()}
                </p>
              </div>
            ))}
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
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message</label>
              <textarea
                placeholder="Notification message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Recipients</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              >
                <option>All Registrants ({event.registrations})</option>
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