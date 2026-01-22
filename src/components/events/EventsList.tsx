import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Copy, Trash2, Eye, MapPin, Calendar, Users, Star } from 'lucide-react';
import { UserRole } from '../../App';
import { toast } from 'sonner@2.0.3';
import { getAllEvents, deleteEvent as deleteEventApi, EventApiResponse } from '../../services/eventsApi';

interface EventsListProps {
  role: UserRole;
}

// DEMO ONLY: sample tracks for UI - replace with API/event.track when available
const DEMO_TRACKS = ['Al Wathba Circuit', 'Yas Marina Circuit', 'Desert Route 1', 'Corniche Road'];

export function EventsList({ role }: EventsListProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // DEMO ONLY: temporary state for rating display - remove when real rating from API is available
  const [demoRatings, setDemoRatings] = useState<Record<string, number>>({});
  // DEMO ONLY: temporary state for track - remove when event.track or API is available
  const [demoTracks, setDemoTracks] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  // DEMO ONLY: seed demo ratings when events load (deterministic from event id for stable display)
  useEffect(() => {
    if (events.length === 0) return;
    setDemoRatings((prev) => {
      const next = { ...prev };
      events.forEach((e) => {
        const id = e._id || e.id || '';
        if (id && !(id in next)) {
          const hash = (id).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
          next[id] = Math.min(5, Math.max(1, 3 + (hash % 20) / 10)); // 3.0–4.9, clamped 1–5
        }
      });
      return next;
    });
  }, [events]);

  // DEMO ONLY: seed demo tracks when events load (deterministic from event id) - replace with event.track when API has it
  useEffect(() => {
    if (events.length === 0) return;
    setDemoTracks((prev) => {
      const next = { ...prev };
      events.forEach((e) => {
        const id = e._id || e.id || '';
        if (id && !(id in next)) {
          const hash = (id).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
          next[id] = DEMO_TRACKS[hash % DEMO_TRACKS.length];
        }
      });
      return next;
    });
  }, [events]);

  const loadEvents = async () => {
  
    
    setIsLoading(true);
    try {
      const apiStatus = statusFilter === 'all' ? undefined : 
        statusFilter === 'Published' ? 'upcoming' :
        statusFilter === 'Draft' ? 'upcoming' :
        statusFilter.toLowerCase() as 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
      
  
      
     
      const fetchedEvents = await getAllEvents({ 
        status: apiStatus,
        page: 1,
        limit: 100 
      });
 
      
      setEvents(fetchedEvents);
    } catch (error: any) {
      console.error('❌ Error in loadEvents:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      toast.error('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCity = cityFilter === 'all' || event.address?.toLowerCase().includes(cityFilter.toLowerCase()) || false;
    return matchesSearch && matchesCity;
  });

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEventApi(eventToDelete);
        toast.success('Event deleted successfully');
        setShowDeleteModal(false);
        setEventToDelete(null);
        loadEvents(); // Reload events after deletion
      } catch (error: any) {
        console.error('Error deleting event:', error);
        toast.error(error.response?.data?.message || 'Failed to delete event. Please try again.');
      }
    }
  };

  const handleDuplicate = (event: EventApiResponse) => {
    // toast.success('Event duplicated successfully');
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
            onClick={() => navigate('/events/create')}
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
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="p-6 rounded-2xl shadow-sm bg-white overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8" style={{ color: '#666' }}>Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#666' }}>No events found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Event</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>city</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Date</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Track</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Registrations</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Rating</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Status</th>
                  <th className="text-left py-4 px-3 text-sm" style={{ color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const eventId = event._id || event.id || '';
                  return (
                    <tr
                      key={eventId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {event.mainImage && (
                            <img
                              src={event.mainImage}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm mb-1" style={{ color: '#333' }}>{event.title}</div>
                            <div className="text-xs" style={{ color: '#999' }}>
                              {event.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>{event.address}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>
                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-sm" style={{ color: '#334155' }}>
                          {demoTracks[eventId] ?? (event as EventApiResponse & { track?: string }).track ?? '—'}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>{event.maxParticipants}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {(() => {
                          // DEMO: use demoRatings; fallback to API rating when available
                          const rating = demoRatings[eventId] ?? (event as EventApiResponse & { rating?: number }).rating;
                          return typeof rating === 'number' ? (
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-amber-400" style={{ color: '#EAB308' }} />
                              <span className="text-sm" style={{ color: '#334155' }}>{rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: '#999' }}>—</span>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-3">
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
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/events/${eventId}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" style={{ color: '#666' }} />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => navigate(`/events/${eventId}/edit`)}
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
                                onClick={() => handleDelete(eventId)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
