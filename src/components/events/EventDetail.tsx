import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Bell, ImageIcon, Trophy, UserCheck, Users, Star, Share2, Calendar, MapPin, Clock, Award, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { getEvent } from '../../data/eventsData';
import { getEventById, updateEvent as updateEventApi, EventApiResponse, getEventResults } from '../../services/eventsApi';

interface EventDetailProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventDetail({ role }: EventDetailProps) {

  const { id } = useParams<{ id: string }>();
  const eventId = id ?? '';
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventApiResponse | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results' | 'gallery' | 'notifications'>('overview');

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    if (!eventId || eventId === 'undefined') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [fetchedEvent, fetchedParticipants] = await Promise.all([
        getEventById(eventId),
        getEventResults(eventId),
      ]);
      setEvent(fetchedEvent);
      setParticipants(fetchedParticipants);
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('participants',participants);

  if (isLoading) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8" style={{ color: '#666' }}>Event not found</div>;
  }

  const canEdit = role === 'super-admin' || role === 'content-manager' || role === 'community-manager';


  // const event = getEvent(eventId);
  // const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results' | 'gallery' | 'notifications'>('overview');


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
    // toast.success('Event duplicated successfully');
    // navigate('/sevents');
  };

  const handleSendPush = () => {
    toast.success('Push notification sent to all registrants');
  };

  const handleFeaturedToggle = async () => {
    const next = !(event!.featured ?? true);
    setUpdatingField('featured');
    try {
      await updateEventApi(eventId, { featured: next });
      setEvent((prev) => (prev ? { ...prev, featured: next } : null));
      toast.success(next ? 'Event featured' : 'Event unfeatured');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingField(null);
    }
  };

  const handleRegistrationToggle = async () => {
    const next = !(event!.registrationOpen ?? true);
    setUpdatingField('registration');
    try {
      await updateEventApi(eventId, { registrationOpen: next });
      setEvent((prev) => (prev ? { ...prev, registrationOpen: next } : null));
      toast.success(next ? 'Registration opened' : 'Registration closed');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingField(null);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl" style={{ color: '#333' }}>{event.title}</h1>
              {event.isFeatured && (
                <Star className="w-6 h-6 fill-current" style={{ color: '#F59E0B' }} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs text-white"
                style={{
                  backgroundColor:
                    event.category === 'Race' ? '#C12D32' :
                    event.category === 'Community Ride' ? '#10B981' :
                    event.category === 'Training & Clinics' ? '#3B82F6' :
                    event.category === 'Awareness Rides' ? '#EC4899' :
                    event.category === 'Family & Kids' ? '#F59E0B' : '#8B5CF6'
                }}
              >
                {event.category}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs capitalize text-white"
                style={{
                  backgroundColor:
                    event.status === 'Open' ? '#10B981' :
                    event.status === 'Full' ? '#F59E0B' :
                    event.status === 'Completed' ? '#3B82F6' :
                    event.status === 'Draft' ? '#6B7280' : '#EF4444'
                }}
              >
                {event.status}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/events/${id}/edit`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Edit className="w-5 h-5" />
          Edit Event
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>Registered</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.currentParticipants} / {event.maxParticipants}
          </p>
          <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                backgroundColor: '#C12D32'
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>Checked In</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.checkedIn || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>Completed</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.completed || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>Reward Points</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {/* {event.rewards.points} */}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'overview' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'overview' ? '2px solid #C12D32' : 'none',
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'participants' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'participants' ? '2px solid #C12D32' : 'none',
          }}
        >
          Participants
        </button>
        {event.category === 'Race' && (
          <button
            onClick={() => setActiveTab('results')}
            className="px-6 py-3 transition-colors"
            style={{
              color: activeTab === 'results' ? '#C12D32' : '#666',
              borderBottom: activeTab === 'results' ? '2px solid #C12D32' : 'none',
            }}
          >
            Results
          </button>
        )}
        <button
          onClick={() => setActiveTab('gallery')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'gallery' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'gallery' ? '2px solid #C12D32' : 'none',
          }}
        >
          Gallery
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'notifications' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'notifications' ? '2px solid #C12D32' : 'none',
          }}
        >
          Notifications
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img src={event.mainImage} alt={event.title} className="w-full h-64 object-cover" />
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-3" style={{ color: '#333' }}>About This Event</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Event Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Date</p>
                    <p style={{ color: '#333' }}>
                      {new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Time</p>
                    <p style={{ color: '#333' }}>{event.startTime} - {event.endTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Location</p>
                    <p style={{ color: '#333' }}>{event.trackName}</p>
                    <p className="text-sm" style={{ color: '#999' }}>{event.city}, {event.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Community</p>
                    <p style={{ color: '#333' }}>{event.communityName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule */}
            {event.schedule.length > 0 && (
              <div className="p-6 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>Event Schedule</h3>
                <div className="space-y-3">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                      <span className="text-sm font-medium" style={{ color: '#C12D32', minWidth: '60px' }}>
                        {item.time}
                      </span>
                      <span style={{ color: '#666' }}>{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {event.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ride Info */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Ride Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Distance</p>
                  <p className="text-xl" style={{ color: '#333' }}>{event.distance} km</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Difficulty</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm text-white"
                    style={{
                      backgroundColor: 
                        event.difficulty === 'Easy' ? '#10B981' :
                        event.difficulty === 'Medium' ? '#F59E0B' : '#EF4444'
                    }}
                  >
                    {event.difficulty}
                  </span>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Registration Fee</p>
                  <p className="text-xl" style={{ color: '#10B981' }}>FREE</p>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Eligibility</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Age Requirement</p>
                  <p style={{ color: '#333' }}>{event.minAge}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Bike Type</p>
                  <p style={{ color: '#333' }}>{event.eligibility.bikeType}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Experience Level</p>
                  {/* <p style={{ color: '#333' }}>{event.eligibility?.[0].experienceLevel}</p> */}
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Rewards</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Points</p>
                  {/* <p className="text-xl" style={{ color: '#C12D32' }}>{event.rewards.points} pts</p> */}
                </div>
                {/* {event.rewards.badgeName && (
                  <div> */}
                    <p className="text-sm mb-1" style={{ color: '#666' }}>Badge</p>
                    {/* <p style={{ color: '#333' }}>{event.rewards.badgeName}</p>
                  </div>
                )} */}
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Featured</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.isFeatured ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Cancellation</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.allowCancellation ? 'Allowed' : 'Not Allowed'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-3">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Quick Actions</h3>
              
              <button
                onClick={() => navigate('event-participants', { selectedEventId: eventId })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <UserCheck className="w-5 h-5" />
                Manage Participants
              </button>

              {event.category === 'Race' && (
                <button
                  onClick={() => navigate('event-results', { selectedEventId: eventId })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <Trophy className="w-5 h-5" />
                  Enter Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>Participant Management</h3>
            <button
              onClick={() => navigate('event-participants', { selectedEventId: id })}
              className="px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32' }}
            >
              Full Management View
            </button>
          </div>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p style={{ color: '#666' }}>No participants yet.</p>
            ) : (
              <div className="grid gap-3">
                {participants.slice(0, 10).map((participant, index) => (
                  <div key={participant._id || participant.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" style={{ color: '#666' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#333' }}>{participant.user?.fullName || participant.userName || 'Unknown'}</p>
                        <p className="text-sm" style={{ color: '#666' }}>{participant.user?.email || participant.userCommunity || 'No community'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        participant.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                        participant.rank ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.rank ? `Rank #${participant.rank}` : (participant.status || 'Registered')}
                      </span>
                    </div>
                  </div>
                ))}
                {participants.length > 10 && (
                  <p className="text-sm text-center" style={{ color: '#666' }}>
                    And {participants.length - 10} more participants...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && event.category === 'Race' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>Race Results</h3>
            <button
              onClick={() => navigate('event-results', { selectedEventId: eventId })}
              className="px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32' }}
            >
              Enter Results
            </button>
          </div>
          <p style={{ color: '#666' }}>Use the results page to enter finish times, ranks, and publish final standings.</p>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-6" style={{ color: '#333' }}>Event Gallery</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {event.galleryImages.length > 0 ? (
              event.galleryImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-3 p-12 text-center border-2 border-dashed rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#CCC' }} />
                <p style={{ color: '#999' }}>No gallery images yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-6" style={{ color: '#333' }}>Send Notifications</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Send To</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600">
                <option>All Event Participants</option>
                <option>Registered Only</option>
                <option>Checked-In Only</option>
                <option>Entire Community</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message Title</label>
              <input
                type="text"
                placeholder="Event Update"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message</label>
              <textarea
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-md"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Bell className="w-5 h-5" />
            Send Push Notification
          </button>
        </div>
      )}
    </div>
  );
}