import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Users, Calendar, Trophy, CheckCircle, XCircle, AlertTriangle, AlertCircle, Activity, Shield, Trash2 } from 'lucide-react';
import { UserRole } from '../../App';
import { getTrack, updateTrack } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';
import { getTrackById, getTrackResults, trackCommunityResults, deleteTrack as deleteTrackApi } from '../../services/trackService';

interface TrackDetailProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

type TabType = 'overview' | 'events' | 'safety' | 'media' | 'communities';

export function TrackDetail({  role }: TrackDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const trackId = id;
  // console.log('eventId', track);
  const [linkedEvents, setLinkedEvents] = useState<any[]>([]);
  const [linkedCommunities, setLinkedCommunities] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ track, setTrack ] = useState<any>(null);
  // const [ deleteTrack, setDeleteTrack ] = useState<any[]>([]);
  // const track = getTrackById(id);

  useEffect(() => {
    if (!trackId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchTrack = async () => {
      try {
        setLoading(true);
        const result = await getTrackById(trackId);
        if (!cancelled) setTrack(result);
      } catch (error) {
        if (!cancelled) setTrack(null);
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTrack();
    return () => { cancelled = true; };
  }, [trackId]);
// console.log('trackData',track);

  useEffect(() => {
    if (!trackId) return;
    const fetchEvents = async () => {
      try {
        const data = await getTrackResults(trackId);
        setLinkedEvents(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [trackId]);

  useEffect(() => {
    if (!trackId) return;
    let cancelled = false;
    const fetchCommunities = async () => {
      try {
        const data = await trackCommunityResults(trackId);
        if (!cancelled) setLinkedCommunities(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) setLinkedCommunities([]);
        console.error(error);
      }
    };
    fetchCommunities();
    return () => { cancelled = true; };
  }, [trackId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg" style={{ color: '#666' }}>Loading track...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="text-lg" style={{ color: '#666' }}>Track not found</div>
        <button
          onClick={() => navigate('/tracks')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#C12D32' }}
        >
          Back to Tracks
        </button>
      </div>
    );
  }

  const canEdit = role === 'super-admin';
  const trackIdForApi = trackId ?? track?._id ?? track?.id ?? '';

  const handleDelete = async () => {
    if (!trackIdForApi || deleting) return;
    try {
      setDeleting(true);
      await deleteTrackApi(trackIdForApi);
      toast.success('Track deleted successfully');
      setShowDeleteModal(false);
      navigate('/tracks');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete track');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleUnpublish = () => {
    if (confirm('Are you sure you want to unpublish this track?')) {
      updateTrack(trackId!, { status: 'Draft' });
      toast.success('Track unpublished successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/tracks')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl" style={{ color: '#333' }}>{track.title}</h1>
              <span
                className="px-3 py-1 rounded-full text-xs capitalize text-white"
                style={{
                  backgroundColor:
                    track.status === 'Open' ? '#10B981' :
                    track.status === 'Closed' ? '#EF4444' : '#F59E0B'
                }}
              >
                {track.status}
              </span>
            </div>
            <p style={{ color: '#666' }}>{track.city}, {track.area}</p>
          </div>
        </div>

        <button
          onClick={() => trackIdForApi && navigate(`/tracks/${trackIdForApi}/edit`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Edit className="w-5 h-5" />
          <span>Edit</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['overview', 'events', 'safety', 'media', 'communities'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize transition-all"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab === 'events' ? 'Events Using Track' : tab === 'communities' ? 'Communities' : tab}
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
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img src={track.coverImage || track.image} alt={track.title ?? track.name} className="w-full h-64 object-cover" />
            </div>

            {/* Track Info */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>Track Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-sm mb-1" style={{ color: '#999' }}>Distance</div>
                  <div className="text-2xl" style={{ color: '#333' }}>{track.distance} km</div>
                </div>
                {track.elevation && (
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#999' }}>Elevation</div>
                    <div className="text-2xl" style={{ color: '#333' }}>{track.elevation} m</div>
                  </div>
                )}
                <div>
                  <div className="text-sm mb-1" style={{ color: '#999' }}>Events</div>
                  <div className="text-2xl" style={{ color: '#333' }}>{track.eventsCount ?? linkedEvents.length}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} />
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Location</div>
                    <div className="text-sm" style={{ color: '#333' }}>{track.area}, {track.city}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                 <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C12D32' }} /> 
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#666' }}>Track Type</div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs text-white"
                        style={{
                          backgroundColor:
                            track.difficulty === 'Easy' ? '#CF9F0C' :
                            track.difficulty === 'Medium' ? '#E1C06E' : '#C12D32'
                        }}
                      >
                        {track.difficulty}
                      </span>
                      <span className="text-sm" style={{ color: '#666' }}>{track.surfaceType} Surface</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {track.hasLighting && (
                    <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                      Lighting Available
                    </span>
                  )}
                  {track.nightRidingAllowed && (
                    <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#E1C06E', color: '#333' }}>
                      Night Riding
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Map Preview */}
            {track.mapPreview && (
              <div className="p-6 rounded-2xl shadow-sm bg-white">
                <h2 className="text-xl mb-4" style={{ color: '#333' }}>Route Map</h2>
                <div className="rounded-lg overflow-hidden">
                  <img src={track.mapPreview} alt="Route map" className="w-full h-64 object-cover" />
                </div>
              </div>
            )}

            {/* Facilities */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Available Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {track.facilities?.length ? track.facilities.map((facility: string) => (
                  <span
                    key={facility}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {facility}
                  </span>
                )) : (<p className="text-sm" style={{ color: '#999' }}>No facilities listed</p>)}
                {track.facilities.length === 0 && (
                  <p className="text-sm" style={{ color: '#999' }}>No facilities listed</p>
                )}
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
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Track</span>
                  </button>
                  {track.status === 'Active' && (
                    <button
                      onClick={handleUnpublish}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                      style={{ backgroundColor: '#E1C06E', color: '#333' }}
                    >
                      <span>Unpublish</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                    style={{ backgroundColor: '#C12D32' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Track Status */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Status</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: track.status === 'Active' ? '#CF9F0C' : '#999' }}
                  >
                    {track.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Events</span>
                  <span className="text-sm" style={{ color: '#333' }}>{track.eventsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Safety Level</span>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" style={{ 
                      color: track.safetyLevel === 'High' ? '#CF9F0C' : track.safetyLevel === 'Medium' ? '#E1C06E' : '#C12D32'
                    }} />
                    <span className="text-sm" style={{ color: '#333' }}>{track.safetyLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Events Using This Track ({linkedEvents.length})</h2>
          
          <div className="space-y-3">
            {linkedEvents.length > 0 ? (
              linkedEvents.map((event: any) => {
                const eventId = event.id ?? event._id;
                const eventName = event.title ?? event.name;
                const eventDate = event.eventDate ?? event.date;
                return (
                  <div
                    key={eventId ?? event.name}
                    className="p-4 rounded-xl hover:shadow-md transition-all cursor-pointer"
                    style={{ backgroundColor: '#FFF9EF' }}
                    onClick={() => eventId && navigate(`/events/${eventId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm mb-1" style={{ color: '#333' }}>{eventName}</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
                          <Calendar className="w-3 h-3" />
                          <span>{eventDate ? new Date(eventDate).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: '#666' }}>
                        {event.registrations ?? event.maxParticipants ?? '—'} registered
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center" style={{ color: '#666' }}>
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No events using this track</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Media</h2>

          {/* Cover / main image */}
          {(track.coverImage || track.image) && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3" style={{ color: '#666' }}>Cover Image</h3>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img
                  src={track.coverImage || track.image}
                  alt={track.title || track.name}
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          )}

          {/* Gallery images */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: '#666' }}>
              Gallery ({track.galleryImages?.length ?? 0})
            </h3>
            {track.galleryImages?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {track.galleryImages.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden shadow-sm bg-gray-100 aspect-square"
                  >
                    <img
                      src={url}
                      alt={`${track.title || track.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                <p className="text-sm" style={{ color: '#999' }}>No gallery images yet</p>
                <p className="text-xs mt-1" style={{ color: '#999' }}>Add images when editing this track</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>Safety Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm mb-3" style={{ color: '#999' }}>Safety Requirements</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${track.helmetRequired ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {track.helmetRequired && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: '#333' }}>Helmet Required</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${track.nightRidingAllowed ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {track.nightRidingAllowed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: '#333' }}>Night Riding Allowed</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#999' }}>Traffic Level</div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded text-sm text-white"
                  style={{
                    backgroundColor:
                      track.trafficLevel === 'Low' ? '#CF9F0C' :
                      track.trafficLevel === 'Medium' ? '#E1C06E' : '#C12D32'
                  }}
                >
                  {track.trafficLevel}
                </span>
              </div>
            </div>

            {track.safetyNotes && (
              <div>
                <div className="text-sm mb-2" style={{ color: '#999' }}>Safety Notes</div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                  <p className="text-sm" style={{ color: '#333' }}>{track.safetyNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Track Media</h2>
          <div className="space-y-6">
            {(track.image || track.coverImage) && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: '#666' }}>Cover / Thumbnail</h3>
                <div className="rounded-xl overflow-hidden border border-gray-200 max-w-2xl">
                  <img
                    src={track.coverImage || track.image}
                    alt={track.title ?? track.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}
            {track.galleryImages && track.galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: '#666' }}>Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {track.galleryImages.map((url: string, idx: number) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 aspect-square">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!track.image && !track.coverImage && (!track.galleryImages || track.galleryImages.length === 0) && (
              <div className="p-12 text-center" style={{ color: '#666' }}>
                <p>No media uploaded for this track.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Events (same list, detailed cards) */}
      {activeTab === 'events' && linkedEvents.length > 0 && (
        <div className="p-6 rounded-2xl bg-white shadow-sm mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>Upcoming Events on this Track</h3>
          </div>
          <div className="space-y-4">
            {linkedEvents.map((event: any) => {
              const eventId = event.id ?? event._id;
              const eventName = event.title ?? event.name;
              const eventDate = event.eventDate ?? event.date;
              return (
                <div
                  key={eventId ?? event.name}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg mb-2" style={{ color: '#333' }}>{eventName}</h4>
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        {event.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs text-white"
                            style={{
                              backgroundColor:
                                event.category === 'Race' ? '#C12D32' :
                                event.category === 'Community Ride' ? '#10B981' : '#3B82F6'
                            }}
                          >
                            {event.category}
                          </span>
                        )}
                        {event.communityName && (
                          <span className="text-sm" style={{ color: '#666' }}>{event.communityName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {eventDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>
                              {new Date(eventDate).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        {event.status && (
                          <span
                            className="px-2 py-1 rounded-full text-xs capitalize text-white"
                            style={{
                              backgroundColor:
                                event.status === 'Open' ? '#10B981' :
                                event.status === 'Full' ? '#F59E0B' : '#3B82F6'
                            }}
                          >
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {eventId && (
                      <button
                        onClick={() => navigate(`/events/${eventId}`)}
                        className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#ECC180', color: '#333' }}
                      >
                        View Event
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>Communities Using this Track</h3>
          </div>

          {linkedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedCommunities.map((community: any) => (
                <div
                  key={community.id}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/communities/${community.id ?? community._id}`)}
                >
                  <div className="flex items-start gap-3">
                    <img src={community.logo} alt={community.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="mb-1" style={{ color: '#333' }}>{community.name}</h4>
                      <p className="text-sm mb-2" style={{ color: '#666' }}>{community.city}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" style={{ color: '#999' }} />
                          <span className="text-xs" style={{ color: '#666' }}>{community.stats.members} members</span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs capitalize"
                          style={{ backgroundColor: '#ECC180', color: '#333' }}
                        >
                          {community.communityType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>No communities linked</p>
              <p className="text-sm" style={{ color: '#999' }}>No communities have selected this as a primary track</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
              <h3 className="text-xl" style={{ color: '#333' }}>Delete Track?</h3>
            </div>
            <p className="mb-6" style={{ color: '#666' }}>
              This will permanently delete &quot;{track.title ?? track.name}&quot;. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-60"
                style={{ backgroundColor: '#EF4444' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
            {track.mapPreview && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img src={track.mapPreview} alt="Map" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
