import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../App';
import { Plus, Search, Calendar, Users, MapPin, Star, Edit, Eye, UserCheck, Trophy, Ban, Archive } from 'lucide-react';
import { availableCategories, availableCities } from '../../data/eventsData';
import { getAllEvents, deleteEvent as deleteEventApi, EventApiResponse } from '../../services/eventsApi';
import { toast } from 'sonner';
import { CardSkeleton } from '../ui/skeleton';
import { getAllTracks, deleteTrack } from '../../services/trackService';
import { getAllCommunities, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { FiChevronDown } from "react-icons/fi";

interface EventsListProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}


export function EventsList({ role }: EventsListProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const [communities, setCommunities] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState('');

  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [communityFilter, setCommunityFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // DEMO ONLY: temporary state for rating display - remove when real rating from API is available
  // DEMO ONLY: temporary state for track - remove when event.track or API is available
  const [demoTracks, setDemoTracks] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);

        const apiStatus = statusFilter || undefined;

        const [communityData, trackData, eventsResponse] = await Promise.all([
          getAllCommunities(),
          getAllTracks(),
          getAllEvents({ status: apiStatus, page: 1, limit: 100 }),
        ]);

        setCommunities(Array.isArray(communityData) ? communityData : []);
        setTracks(Array.isArray(trackData) ? trackData : []);
        setEvents((eventsResponse as any)?.events || eventsResponse || []);
      } catch (error) {
        toast.error(t('events.toasts.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [statusFilter]);

  // Re-fetch when language changes so backend returns translated values
  useEffect(() => {
    const onLanguageChanged = () => {
      const fetchAll = async () => {
        try {
          setIsLoading(true);
          const apiStatus = statusFilter || undefined;
          const [communityData, trackData, eventsResponse] = await Promise.all([
            getAllCommunities(),
            getAllTracks(),
            getAllEvents({ status: apiStatus, page: 1, limit: 100 }),
          ]);
          setCommunities(Array.isArray(communityData) ? communityData : []);
          setTracks(Array.isArray(trackData) ? trackData : []);
          setEvents((eventsResponse as any)?.events || eventsResponse || []);
        } catch (error) {
          toast.error(t('events.toasts.loadError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchAll();
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => { i18n.off('languageChanged', onLanguageChanged); };
  }, [i18n, statusFilter, t]);

  const toggleCategory = (category: string) => {
    setCategoryFilter(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const stats = {
    total: events.length,
    open: events.filter(e => e.status === 'Open').length,
    completed: events.filter(e => e.status === 'Completed').length,
    participants: events.reduce((sum, e) => sum + e.currentParticipants, 0),
  };


  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !searchTerm || event.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity =
        !cityFilter || event.city?.toLowerCase() === cityFilter.toLowerCase() ||
        event.address?.toLowerCase().includes(cityFilter.toLowerCase());

      const matchesCommunity =
        !communityFilter ||
        (event.communityId?._id || event.communityId?.id) === communityFilter;

      const matchesTrack =
        !trackFilter ||
        (event.trackId?._id || event.trackId?.id) === trackFilter;

      const matchesCategory =
        categoryFilter.length === 0 ||
        categoryFilter.includes(event.category || '');

      const matchesFeatured =
        !featuredFilter ||
        (featuredFilter === 'yes' && event.isFeatured) ||
        (featuredFilter === 'no' && !event.isFeatured);

      return matchesSearch && matchesCity && matchesCommunity && matchesTrack && matchesCategory && matchesFeatured;
    });
  }, [events, searchTerm, cityFilter, communityFilter, trackFilter, categoryFilter, featuredFilter]);

  const trackStats = useMemo(() => {
    const stats: Record<string, { eventsCount: number; communitiesCount: number }> = {};

    // Count events per track
    events.forEach(event => {
      const trackId = event.trackId?._id || event.trackId?.id;
      if (trackId) {
        if (!stats[trackId]) {
          stats[trackId] = { eventsCount: 0, communitiesCount: 0 };
        }
        stats[trackId].eventsCount++;
      }
    });

    // Count communities per track
    communities.forEach(community => {
      const trackId = community.trackId?._id || community.trackId?.id || community.trackId;
      if (trackId) {
        if (!stats[trackId]) {
          stats[trackId] = { eventsCount: 0, communitiesCount: 0 };
        }
        stats[trackId].communitiesCount++;
      }
    });

    return stats;
  }, [events, communities]);



  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEventApi(eventToDelete);

      setEvents(prev => prev.filter(e => ((e as any)._id ?? (e as any).id) !== eventToDelete));

      toast.success(t('events.toasts.deleteSuccess'));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('events.toasts.deleteError'));
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // const selectedTrack = tracks.find(t => t.id === formData.trackId);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('events.title')}</h1>
          <p style={{ color: '#666' }}>{t('events.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#C12D32' }}
        >
          <Plus className="w-5 h-5" />
          {t('events.createButton')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#666' }}>{t('events.totalEvents')}</span>
            <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
          </div>
          <p className="text-3xl mb-1" style={{ color: '#333' }}>{stats.total}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#666' }}>{t('events.openForRegistration')}</span>
            <Calendar className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <p className="text-3xl mb-1" style={{ color: '#333' }}>{stats.open}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#666' }}>{t('events.completed')}</span>
            <Trophy className="w-5 h-5" style={{ color: '#F59E0B' }} />
          </div>
          <p className="text-3xl mb-1" style={{ color: '#333' }}>{stats.completed}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#666' }}>{t('events.totalParticipants')}</span>
            <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
          </div>
          <p className="text-3xl mb-1" style={{ color: '#333' }}>{stats.participants}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
        <h3 className="text-lg" style={{ color: '#333' }}>{t('events.filters.title', 'Filters')}</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
          <input
            type="text"
            placeholder={t('events.filters.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.filters.community')}</label>
            <select
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              className="w-full px-4 py-2  rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.filters.allCommunities')}</option>
              {communities.map(community => (
                <option key={community._id || community.id} value={community._id || community.id}>{community.title || community.name}</option>
              ))}
            </select>
            
          </div>
          {/* <div className="relative w-full">
            <select
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              className="w-full px-4 py-2 pr-10 appearance-none rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.filters.allCommunities')}</option>

              {communities.map((community) => (
                <option
                  key={community._id || community.id}
                  value={community._id || community.id}
                >
                  {community.title || community.name}
                </option>
              ))}
            </select>

            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div> */}

          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.filters.city')}</label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setTrackFilter(''); // Reset track filter when city changes
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.filters.allCities')}</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{t(`data.locations.${city}`, city)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.filters.track')}</label>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={!cityFilter && tracks.length > 20}
            >
              <option value="">{t('events.filters.allTracks')}</option>
              {tracks.map(track => (
                <option key={track._id || track.id} value={track._id || track.id}>{track.title || track.name}</option>
              ))}
            </select>
            {!cityFilter && tracks.length > 20 && (
              <p className="text-xs mt-1" style={{ color: '#999' }}>{t('events.filters.selectCityFirst')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.filters.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.filters.allStatus')}</option>
              <option value="Draft">{t('events.filters.draft')}</option>
              <option value="Open">{t('events.filters.open')}</option>
              <option value="Full">{t('events.filters.full')}</option>
              <option value="Completed">{t('events.filters.completed')}</option>
              <option value="Archived">{t('events.filters.archived')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.filters.featured')}</label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.filters.featuredAll')}</option>
              <option value="yes">{t('events.filters.featuredOnly')}</option>
              <option value="no">{t('events.filters.notFeatured')}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter([]);
                setCommunityFilter('');
                setCityFilter('');
                setTrackFilter('');
                setStatusFilter('');
                setFeaturedFilter('');
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#666' }}
            >
              {t('events.filters.clearFilters')}
            </button>
          </div>
        </div>

        {/* Category Multi-Select */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('events.card.categories')}</label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="px-3 py-1 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: categoryFilter.includes(category) ? '#C12D32' : '#F3F4F6',
                  color: categoryFilter.includes(category) ? '#fff' : '#666',
                }}
              >
                {t(`data.eventCategories.${category}`, category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => {
            const eventId = (event as any)._id ?? (event as any).id;
            return (
              <div
                key={eventId}
                className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all relative"
              >
                <div className="flex items-start gap-6">
                  {/* Cover Image */}
                  <img
                    src={event.mainImage ? event.mainImage : event.eventImag}
                    alt={event.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl" style={{ color: '#333' }}>{event.title}</h3>
                          {event.isFeatured && (
                            <Star className="w-5 h-5 fill-current" style={{ color: '#F59E0B' }} />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-2">
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
                            {event.category ? t(`data.eventCategories.${event.category}`, event.category) : t('events.card.noCategory', 'Uncategorized')}
                          </span>
                          <span className="text-sm" style={{ color: '#666' }}>{event.communityId?.title || t('events.card.noCommunity')}</span>
                          <span className="text-sm" style={{ color: '#666' }}>|</span>
                          <span className="text-sm" style={{ color: '#666' }}>
                            {event.trackId?.title || t('events.card.noTrack')}
                            {(() => {
                              const trackId = event.trackId?._id || event.trackId?.id;
                              const stats = trackId ? trackStats[trackId] : null;
                              return stats ? ` (${t('events.card.trackStats', { events: stats.eventsCount, communities: stats.communitiesCount })})` : '';
                            })()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>
                              {new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>
                              {event.currentParticipants} / {event.maxParticipants}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>{event.city ? t(`data.locations.${event.city}`, event.city) : t('events.card.noLocation', 'No Location')}</span>
                          </div>
                        </div>
                      </div>

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

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/events/${eventId}`)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#ECC180', color: '#333' }}
                      >
                        <Eye className="w-4 h-4" />
                        {t('events.card.view')}
                      </button>

                      <button
                        onClick={() => navigate(`/events/${eventId}/edit`)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                      >
                        <Edit className="w-4 h-4" />
                        {t('events.card.edit')}
                      </button>

                      <button
                        onClick={() => navigate(`/events/${eventId}/event-participants`)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                      >
                        <UserCheck className="w-4 h-4" />
                        {t('events.card.participants')}
                      </button>

                      {event.category === 'Race' && (
                        <button
                          onClick={() => navigate('event-results', { selectedEventId: eventId })}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#E5E7EB', color: '#333' }}
                        >
                          <Trophy className="w-4 h-4" />
                          {t('events.card.results')}
                        </button>
                      )}

                      {event.status !== 'Archived' && (
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#FEE2E2', color: '#C12D32' }}
                        >
                          <Ban className="w-4 h-4" />
                          {t('events.card.disable')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="p-12 rounded-2xl bg-white text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>{t('events.empty.noResults')}</p>
              <p className="text-sm" style={{ color: '#999' }}>{t('events.empty.tryFilters')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}