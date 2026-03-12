import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Copy, Bell, ImageIcon, Trophy, UserCheck, Users, Star, Share2, Calendar, MapPin, Clock, Award, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../../App';
import { getEvent } from '../../data/eventsData';
import { getEventById, updateEvent as updateEventApi, EventApiResponse, getEventResults } from '../../services/eventsApi';
import { DetailPageSkeleton } from '../ui/skeleton';

interface EventDetailProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventDetail({ role }: EventDetailProps) {
  const { t, i18n } = useTranslation();
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

  // Re-fetch when language changes so backend returns translated values
  useEffect(() => {
    const onLanguageChanged = () => { loadEvent(); };
    i18n.on('languageChanged', onLanguageChanged);
    return () => { i18n.off('languageChanged', onLanguageChanged); };
  }, [i18n]);

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
      toast.error(t('events.detail.toasts.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // console.log('participants',participants);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!event) {
    return <div className="text-center py-8" style={{ color: '#666' }}>{t('events.detail.notFound')}</div>;
  }

  const canEdit = role === 'super-admin' || role === 'content-manager' || role === 'community-manager';


  // const event = getEvent(eventId);
  // const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results' | 'gallery' | 'notifications'>('overview');


   const handleCancel = async () => {
    if (confirm(t('events.detail.confirmCancel'))) {
      setIsSaving(true);
      try {
        await updateEventApi(eventId, { status: 'cancelled' });
        toast.success(t('events.detail.toasts.cancelSuccess'));
        loadEvent(); // Reload event to reflect changes
      } catch (error: any) {
        console.error('Error cancelling event:', error);
        toast.error(error.response?.data?.message || t('events.detail.toasts.failedToCancelEvent'));
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
    toast.success(t('events.detail.toasts.notificationSent'));
  };

  const handleFeaturedToggle = async () => {
    const next = !(event!.featured ?? true);
    setUpdatingField('featured');
    try {
      await updateEventApi(eventId, { featured: next });
      setEvent((prev) => (prev ? { ...prev, featured: next } : null));
      toast.success(next ? t('events.detail.toasts.eventFeatured') : t('events.detail.toasts.eventUnfeatured'));
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('events.detail.toasts.failedToUpdate'));
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
      toast.success(next ? t('events.detail.toasts.registrationOpened') : t('events.detail.toasts.registrationClosed'));
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('events.detail.toasts.failedToUpdate'));
    } finally {
      setUpdatingField(null);
    }
  };

    console.log('event.mainImage',event?.mainImage);

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
                {t(`data.eventCategories.${event.category}`, event.category)}
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
                {t(`data.statuses.${event.status}`, event.status)}
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
          {t('events.detail.editButton')}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.registered')}</span>
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
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.checkedIn')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.checkedIn || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.completed')}</span>
          </div>
          <p className="text-2xl" style={{ color: '#333' }}>
            {event.stats?.completed || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: '#999' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.rewardPoints')}</span>
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
          {t('events.detail.tabs.overview')}
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'participants' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'participants' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.participants')}
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
            {t('events.detail.tabs.results')}
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
          {t('events.detail.tabs.gallery')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className="px-6 py-3 transition-colors"
          style={{
            color: activeTab === 'notifications' ? '#C12D32' : '#666',
            borderBottom: activeTab === 'notifications' ? '2px solid #C12D32' : 'none',
          }}
        >
          {t('events.detail.tabs.notifications')}
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
              <h3 className="text-lg mb-3" style={{ color: '#333' }}>{t('events.detail.aboutEvent')}</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eventDetails')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.date')}</p>
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
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.time')}</p>
                    <p style={{ color: '#333' }}>{event.startTime} - {event.endTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.location')}</p>
                    <p style={{ color: '#333' }}>{event.trackName}</p>
                    <p className="text-sm" style={{ color: '#999' }}>{event.city}, {event.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-1" style={{ color: '#999' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.community')}</p>
                    <p style={{ color: '#333' }}>{event.communityName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule */}
            {event.schedule.length > 0 && (
              <div className="p-6 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eventSchedule')}</h3>
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
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.amenitiesHeading')}</h3>
              <div className="flex flex-wrap gap-2">
                {event.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {t(`events.create.amenityOptions.${({'medical support': 'medicalSupport', 'bike service': 'bikeService'} as Record<string, string>)[amenity] || amenity}`, amenity)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ride Info */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.rideInfo')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.distance')}</p>
                  <p className="text-xl" style={{ color: '#333' }}>{event.distance} {t('common.km')}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.difficulty')}</p>
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
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.registrationFee')}</p>
                  <p className="text-xl" style={{ color: '#10B981' }}>{t('common.free')}</p>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.eligibility')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.ageRequirement')}</p>
                  <p style={{ color: '#333' }}>{event.minAge}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.bikeType')}</p>
                  <p style={{ color: '#333' }}>{event.eligibility.bikeType}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.experienceLevel')}</p>
                  {/* <p style={{ color: '#333' }}>{event.eligibility?.[0].experienceLevel}</p> */}
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.rewardsHeading')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.points')}</p>
                  {/* <p className="text-xl" style={{ color: '#C12D32' }}>{event.rewards.points} pts</p> */}
                </div>
                {/* {event.rewards.badgeName && (
                  <div> */}
                    <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.detail.labels.badge')}</p>
                    {/* <p style={{ color: '#333' }}>{event.rewards.badgeName}</p>
                  </div>
                )} */}
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.settings')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.labels.featured')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.isFeatured ? t('common.yes') : t('common.no')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('events.detail.labels.cancellation')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{event.allowCancellation ? t('events.detail.allowed') : t('events.detail.notAllowed')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-3">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.detail.quickActions')}</h3>
              
              <button
                onClick={() => navigate('event-participants', { selectedEventId: eventId })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <UserCheck className="w-5 h-5" />
                {t('events.detail.manageParticipants')}
              </button>

              {event.category === 'Race' && (
                <button
                  onClick={() => navigate('event-results', { selectedEventId: eventId })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <Trophy className="w-5 h-5" />
                  {t('events.detail.enterResults')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg" style={{ color: '#333' }}>{t('events.detail.participantsTab.heading')}</h3>
            <button
              onClick={() => navigate('event-participants', { selectedEventId: id })}
              className="px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32' }}
            >
              {t('events.detail.fullManagementView')}
            </button>
          </div>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p style={{ color: '#666' }}>{t('events.detail.participantsTab.noParticipants')}</p>
            ) : (
              <div className="grid gap-3">
                {participants.slice(0, 10).map((participant, index) => (
                  <div key={participant._id || participant.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" style={{ color: '#666' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#333' }}>{participant.user?.fullName || participant.userName || t('events.detail.participantsTab.unknown')}</p>
                        <p className="text-sm" style={{ color: '#666' }}>{participant.user?.email || participant.userCommunity || t('events.detail.participantsTab.noCommunity')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        participant.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                        participant.rank ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.rank ? t('events.detail.participantsTab.rankLabel', { rank: participant.rank }) : (participant.status || t('events.detail.participantsTab.registered'))}
                      </span>
                    </div>
                  </div>
                ))}
                {participants.length > 10 && (
                  <p className="text-sm text-center" style={{ color: '#666' }}>
                    {t('events.detail.participantsTab.moreParticipants', { count: participants.length - 10 })}
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
            <h3 className="text-lg" style={{ color: '#333' }}>{t('events.detail.resultsTab.heading')}</h3>
            <button
              onClick={() => navigate('event-results', { selectedEventId: eventId })}
              className="px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#C12D32' }}
            >
              {t('events.detail.enterResults')}
            </button>
          </div>
          <p style={{ color: '#666' }}>{t('events.detail.resultsTab.body')}</p>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-6" style={{ color: '#333' }}>{t('events.detail.galleryTab.heading')}</h3>
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
                <p style={{ color: '#999' }}>{t('events.detail.galleryTab.noImages')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-6" style={{ color: '#333' }}>{t('events.detail.notificationsTab.heading')}</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.detail.notificationsTab.sendTo')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600">
                <option>{t('events.detail.notificationsTab.allParticipants')}</option>
                <option>{t('events.detail.notificationsTab.registeredOnly')}</option>
                <option>{t('events.detail.notificationsTab.checkedInOnly')}</option>
                <option>{t('events.detail.notificationsTab.entireCommunity')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.detail.notificationsTab.messageTitle')}</label>
              <input
                type="text"
                placeholder={t('events.detail.notificationsTab.messageTitlePlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.detail.notificationsTab.message')}</label>
              <textarea
                placeholder={t('events.detail.notificationsTab.messagePlaceholder')}
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
            {t('events.detail.sendPushNotification')}
          </button>
        </div>
      )}
    </div>
  );
}