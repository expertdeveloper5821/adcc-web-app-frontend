import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Copy, Trash2, Eye, MapPin, Calendar, Users, Star } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllEvents, deleteEvent, Event } from '../../data/eventsData';
import { toast } from 'sonner@2.0.3';

interface EventsListProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventsList({ navigate, role }: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const events = getAllEvents();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || event.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete);
      toast.success('Event deleted successfully');
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const handleDuplicate = (event: Event) => {
    toast.success('Event duplicated successfully');
  };

  const canEdit = role === 'super-admin' || role === 'content-manager' || role === 'community-manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Events</h1>
          <p style={{ color: '#666' }}>Manage cycling events and registrations</p>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate('event-create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Cities</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Dubai">Dubai</option>
            <option value="Al Ain">Al Ain</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="p-6 rounded-2xl shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Event</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>City</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Date</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Track</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Registrations</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Rating</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Status</th>
                <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-sm mb-1" style={{ color: '#333' }}>{event.name}</div>
                        <div className="text-xs" style={{ color: '#999' }}>{event.shortDescription.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                      <span className="text-sm" style={{ color: '#333' }}>{event.city}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                      <span className="text-sm" style={{ color: '#333' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#333' }}>{event.track}</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: '#999' }} />
                      <span className="text-sm" style={{ color: '#333' }}>{event.registrations}/{event.capacity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" style={{ color: '#CF9F0C' }} />
                      <span className="text-sm" style={{ color: '#333' }}>{event.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
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
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('event-detail', { selectedEventId: event.id })}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => navigate('event-detail', { selectedEventId: event.id })}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" style={{ color: '#666' }} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(event)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" style={{ color: '#666' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Event</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
