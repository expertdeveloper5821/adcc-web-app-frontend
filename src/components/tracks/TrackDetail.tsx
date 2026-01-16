import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Activity, Shield, Calendar, AlertCircle } from 'lucide-react';
import { UserRole } from '../../App';
import { getTrack, updateTrack } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';

interface TrackDetailProps {
  role: UserRole;
}

type TabType = 'overview' | 'events' | 'safety' | 'media';

export function TrackDetail({ role }: TrackDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackId = id || '';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const track = getTrack(trackId);

  if (!track) {
    return <div>Track not found</div>;
  }

  const canEdit = role === 'super-admin';

  const handleUnpublish = () => {
    if (confirm('Are you sure you want to unpublish this track?')) {
      updateTrack(trackId, { status: 'Draft' });
      toast.success('Track unpublished successfully');
    }
  };

  const eventsUsingTrack = [
    { id: '1', name: 'Al Wathba Morning Ride', date: '2026-01-15', registrations: 124 },
    { id: '2', name: 'Weekend Challenge', date: '2026-01-22', registrations: 89 },
    { id: '3', name: 'Sunset Ride', date: '2026-01-29', registrations: 67 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tracks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{track.name}</h1>
          <p style={{ color: '#666' }}>{track.shortDescription}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['overview', 'events', 'safety', 'media'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize transition-all"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab === 'events' ? 'Events Using Track' : tab}
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
              <img src={track.image} alt={track.name} className="w-full h-80 object-cover" />
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
                  <div className="text-2xl" style={{ color: '#333' }}>{track.eventsCount}</div>
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
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Events Using This Track ({track.eventsCount})</h2>
          
          <div className="space-y-3">
            {eventsUsingTrack.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-xl hover:shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: '#FFF9EF' }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm mb-1" style={{ color: '#333' }}>{event.name}</div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>
                    {event.registrations} registered
                  </div>
                </div>
              </div>
            ))}
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

      {activeTab === 'media' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Track Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={track.image} alt="Track" className="w-full h-full object-cover" />
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
