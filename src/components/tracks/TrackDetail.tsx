import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Users, Calendar, Trophy, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../App';
import { getTrack, updateTrack } from '../../data/tracksData';

import { getTrackById, getTrackResults, trackCommunityResults, deleteTrack as deleteTrackApi } from '../../services/trackService';
import { toast } from 'sonner';
import { DetailPageSkeleton } from '../ui/skeleton';

interface TrackDetailProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

type TabType = 'overview' | 'events' | 'communities';

export function TrackDetail({  role }: TrackDetailProps) {
  const { t, i18n } = useTranslation();
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

  // Re-fetch when language changes so backend returns translated values
  useEffect(() => {
    if (!trackId) return;
    const onLanguageChanged = async () => {
      try {
        setLoading(true);
        const [trackResult, eventsData, communitiesData] = await Promise.all([
          getTrackById(trackId),
          getTrackResults(trackId),
          trackCommunityResults(trackId),
        ]);
        setTrack(trackResult);
        setLinkedEvents(eventsData || []);
        setLinkedCommunities(Array.isArray(communitiesData) ? communitiesData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => { i18n.off('languageChanged', onLanguageChanged); };
  }, [trackId, i18n]);


  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!trackId || !track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="text-lg" style={{ color: '#666' }}>{t('tracks.detail.notFound')}</div>
        <button
          onClick={() => navigate('/tracks')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#C12D32' }}
        >
          {t('tracks.detail.backToTracks')}
        </button>
      </div>
    );
  }

  const canEdit = role === 'super-admin';
  const trackIdForApi = trackId ?? track?._id ?? track?.id ?? '';
  const upcomingEvents = linkedEvents.filter((e: any) => {
    const d = e.eventDate ?? e.date;
    return d && new Date(d) >= new Date();
  });

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
    if (confirm(t('tracks.detail.unpublishConfirm'))) {
      updateTrack(trackId!, { status: 'Draft' } as any);
      toast.success(t('tracks.detail.toasts.unpublishSuccess'));
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
          <span>{t('tracks.detail.editTrack', 'Edit Track')}</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.labels.distance')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>{track.distance} km</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.eventsTab.upcomingHeading', 'Upcoming Events')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>{upcomingEvents.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.communitiesSection.heading', 'Communities')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>{linkedCommunities.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.labels.difficulty', 'Difficulty')}</span>
          </div>
          <span
            className="inline-block px-3 py-1 rounded-full text-sm text-white"
            style={{
              backgroundColor:
                track.difficulty === 'Easy' ? '#10B981' :
                track.difficulty === 'Medium' ? '#F59E0B' : '#EF4444',
            }}
          >
            {track.difficulty ? (t(`data.difficulties.${track.difficulty}`, { defaultValue: track.difficulty }) as string) : t('tracks.card.na')}
          </span>
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
          {t('tracks.detail.tabs.overview', 'Overview')}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'events' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'events' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('tracks.detail.eventsTab.upcomingHeading', 'Upcoming Events')} ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('communities')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'communities' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'communities' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('tracks.detail.tabs.communities', 'Communities')} ({linkedCommunities.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img src={track.coverImage || track.image} alt={track.title ?? track.name} className="w-full h-64 object-cover" />
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-3" style={{ color: '#333' }}>{t('tracks.detail.aboutHeading', 'About This Track')}</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>{track.description || t('tracks.detail.noDescription', 'No description available.')}</p>
            </div>

            {/* Map Preview */}
            {(track.mapPreview || track.mapImage) && (
              <div className="p-6 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.detail.routeMap', 'Track Map')}</h3>
                <img src={track.mapPreview || track.mapImage} alt={t('tracks.detail.routeMap', 'Track Map')} className="w-full rounded-lg" />
              </div>
            )}

            {/* Facilities */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.detail.facilitiesHeading', 'Available Facilities')}</h3>
              <div className="flex flex-wrap gap-2">
                {(track.facilities && track.facilities.length > 0) ? track.facilities.map((facility: string) => (
                  <span
                    key={facility}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {facility}
                  </span>
                )) : (
                  <p className="text-sm" style={{ color: '#999' }}>{t('tracks.detail.noFacilities', 'No facilities listed')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Track Information */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.detail.trackInformation', 'Track Information')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.detail.labels.city', 'City')}</p>
                  <p style={{ color: '#333' }}>{track.city}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.detail.labels.area', 'Area')}</p>
                  <p style={{ color: '#333' }}>{track.area}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.detail.labels.distance')}</p>
                  <p className="text-xl" style={{ color: '#333' }}>{track.distance} km</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.detail.surfaceLabel', { type: track.surfaceType })}</p>
                  <p style={{ color: '#333' }}>{track.surfaceType ? (t(`data.surfaceTypes.${track.surfaceType}`, { defaultValue: track.surfaceType }) as string) : '—'}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.detail.lightingLabel', 'Lighting')}</p>
                  <div className="flex items-center gap-2">
                    {(track.hasLighting ?? track.lightingAvailable) ? (
                      <>
                        <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                        <span style={{ color: '#10B981' }}>{t('tracks.detail.lightingAvailable', 'Available')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                        <span style={{ color: '#EF4444' }}>{t('tracks.detail.lightingNotAvailable', 'Not Available')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('tracks.detail.usageStats', 'Usage Stats')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.totalEvents', 'Total Events')}</span>
                  <span className="text-lg" style={{ color: '#333' }}>{linkedEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.eventsTab.upcomingHeading', 'Upcoming Events')}</span>
                  <span className="text-lg" style={{ color: '#333' }}>{upcomingEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('tracks.detail.communitiesSection.heading', 'Communities')}</span>
                  <span className="text-lg" style={{ color: '#333' }}>{linkedCommunities.length}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            {canEdit && (
              <div className="p-6 rounded-2xl bg-white shadow-sm border-2" style={{ borderColor: '#FEE2E2' }}>
                <h3 className="text-lg mb-3" style={{ color: '#333' }}>{t('tracks.detail.dangerZone', 'Danger Zone')}</h3>
                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  {t('tracks.detail.deleteTrackDescription', 'Delete this track permanently. This action cannot be undone.')}
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-2 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-60"
                  style={{ backgroundColor: '#EF4444' }}
                  disabled={linkedEvents.length > 0}
                >
                  {linkedEvents.length > 0 ? t('tracks.detail.cannotDeleteHasEvents', 'Cannot Delete (Has Events)') : t('tracks.detail.deleteTrack')}
                </button>
                {linkedEvents.length > 0 && (
                  <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
                    {t('tracks.detail.deleteTrackEventsHint', { count: linkedEvents.length, defaultValue: `This track has ${linkedEvents.length} linked event(s) and cannot be deleted.` })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Events Tab */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('tracks.detail.eventsTab.upcomingOnTrack', 'Upcoming Events on this Track')}</h3>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event: any) => {
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
                        <div className="flex items-center gap-4 mb-2">
                          {event.category && (
                            <span
                              className="px-2 py-1 rounded-full text-xs text-white"
                              style={{
                                backgroundColor:
                                  event.category === 'Race' ? '#C12D32' :
                                  event.category === 'Community Ride' ? '#10B981' : '#3B82F6',
                              }}
                            >
                              {event.category}
                            </span>
                          )}
                          <span className="text-sm" style={{ color: '#666' }}>{event.communityName ?? event.community?.title ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>
                              {eventDate ? new Date(eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                          </div>
                          {event.status && (
                            <span
                              className="px-2 py-1 rounded-full text-xs capitalize text-white"
                              style={{
                                backgroundColor:
                                  event.status === 'Open' ? '#10B981' :
                                  event.status === 'Full' ? '#F59E0B' : '#3B82F6',
                              }}
                            >
                              {event.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eventId && navigate(`/events/${eventId}`)}
                        className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#ECC180', color: '#333' }}
                      >
                        {t('tracks.detail.eventsTab.viewEvent', 'View Event')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>{t('tracks.detail.eventsTab.noUpcoming', 'No upcoming events')}</p>
              <p className="text-sm" style={{ color: '#999' }}>{t('tracks.detail.eventsTab.noUpcomingBody', 'This track has no scheduled events')}</p>
            </div>
          )}
        </div>
      )}

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('tracks.detail.communitiesTabHeading', 'Communities Using this Track')}</h3>
          </div>

          {linkedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedCommunities.map((community: any) => {
                const communityId = community.id ?? community._id;
                const name = community.title ?? community.name;
                const membersCount = community.stats?.members ?? community.memberCount ?? community.membersCount ?? 0;
                return (
                  <div
                    key={communityId}
                    className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => communityId && navigate(`/communities/${communityId}`)}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={community.logo ?? community.image}
                        alt={name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="mb-1" style={{ color: '#333' }}>{name}</h4>
                        <p className="text-sm mb-2" style={{ color: '#666' }}>{community.city ?? community.location}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" style={{ color: '#999' }} />
                            <span className="text-xs" style={{ color: '#666' }}>
                              {typeof membersCount === 'number' ? membersCount : String(membersCount)} {t('tracks.detail.communitiesSection.membersLabel', 'members')}
                            </span>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs capitalize"
                            style={{ backgroundColor: '#ECC180', color: '#333' }}
                          >
                            {community.communityType ?? community.type ?? community.category ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>{t('tracks.detail.communitiesSection.noCommunities', 'No communities linked')}</p>
              <p className="text-sm" style={{ color: '#999' }}>{t('tracks.detail.communitiesSection.noCommunitiesBody', 'No communities have selected this as a primary track')}</p>
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
              <h3 className="text-xl" style={{ color: '#333' }}>{t('tracks.detail.deleteModal.title', 'Delete Track?')}</h3>
            </div>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('tracks.detail.deleteModal.body', { name: track.title ?? track.name, defaultValue: `This will permanently delete "${track.title ?? track.name}". This action cannot be undone.` })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md disabled:opacity-60"
                style={{ backgroundColor: '#EF4444' }}
              >
                {deleting ? t('tracks.detail.deleteModal.deleting', 'Deleting…') : t('tracks.detail.deleteModal.confirm', 'Delete')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                {t('tracks.detail.deleteModal.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
