import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MapPin, Calendar, Users, Edit, Eye, Archive } from 'lucide-react';
import { UserRole } from '../../App';
import { toast } from 'sonner';
import { CardSkeleton } from '../ui/skeleton';
import { getTrackUpcomingEvents, getTrackCommunities } from '../../data/tracksData';
import { getAllTracks, deleteTrack, Track, archiveTrack } from '../../services/trackService';
import { getAllEvents, EventApiResponse } from '../../services/eventsApi';
import { getAllCommunities, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';



interface TracksListProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function TracksList({ role }: TracksListProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [hasEventsFilter, setHasEventsFilter] = useState('all');
  const [hasCommunitiesFilter, setHasCommunitiesFilter] = useState('all');
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  const [archivingId, setArchivingId] = useState<string | null>(null);


  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [results, eventsRes, communitiesRes] = await Promise.all([
        getAllTracks(),
        getAllEvents(),
        getAllCommunities(),
      ]);

      const list =
        Array.isArray(results)
          ? results
          : (results as any)?.tracks || (results as any)?.data?.tracks || (results as any)?.data || [];
      setTracks(Array.isArray(list) ? list : []);

      const eventsList =
        (eventsRes as any)?.events || (eventsRes as any)?.data?.events || eventsRes || [];
      const communitiesList =
        (communitiesRes as any)?.communities || (communitiesRes as any)?.data?.communities || communitiesRes || [];

      setEvents(Array.isArray(eventsList) ? eventsList : []);
      setCommunities(Array.isArray(communitiesList) ? communitiesList : []);
    } catch (err) {
      console.log(err);
      setTracks([]);
      setError(t('tracks.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrackId = (track: any): string | null => {
    if (!track) return null;
    if (typeof track === "string") return track;
    return track._id || track.id || null;
  };


  const trackStats = useMemo(() => {
    const stats: Record<string, { eventsCount: number; communitiesCount: number }> = {};

    events.forEach((event) => {
      const trackId = getTrackId(event.trackId);
      if (!trackId) return;

      if (!stats[trackId]) {
        stats[trackId] = { eventsCount: 0, communitiesCount: 0 };
      }

      stats[trackId].eventsCount += 1;
    });

    communities.forEach((community) => {
      const trackId = getTrackId(community.trackId);
      if (!trackId) return;

      if (!stats[trackId]) {
        stats[trackId] = { eventsCount: 0, communitiesCount: 0 };
      }

      stats[trackId].communitiesCount += 1;
    });

    return stats;
  }, [events, communities]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Re-fetch when language changes so backend returns translated values
  useEffect(() => {
    const onLanguageChanged = () => { fetchTracks(); };
    i18n.on('languageChanged', onLanguageChanged);
    return () => { i18n.off('languageChanged', onLanguageChanged); };
  }, [fetchTracks, i18n]);

  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const name = (track.title ?? '').toString();
      const search = (searchTerm ?? '').toString().toLowerCase();
      const matchesSearch = name.toLowerCase().includes(search);

      const city = (track.city ?? '').toString();
      const matchesCity = cityFilter === 'all' || city === cityFilter;

      const difficulty = (track.difficulty ?? '').toString();
      const matchesDifficulty = difficultyFilter === 'all' || difficulty === difficultyFilter;

      const trackId = getTrackId(track);

      const stats = trackId ? trackStats[trackId] : null;
      const eventsCount = stats?.eventsCount || 0;
      const communitiesCount = stats?.communitiesCount || 0;

      const status = (track.status ?? '').toString();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      const matchesEvents =
        hasEventsFilter === "all" ||
        (hasEventsFilter === "yes" && eventsCount > 0) ||
        (hasEventsFilter === "no" && eventsCount === 0);

      const matchesCommunities =
        hasCommunitiesFilter === "all" ||
        (hasCommunitiesFilter === "yes" && communitiesCount > 0) ||
        (hasCommunitiesFilter === "no" && communitiesCount === 0);


      return matchesSearch && matchesCity && matchesDifficulty && matchesStatus && matchesEvents && matchesCommunities;
    });
  }, [tracks, searchTerm, cityFilter, difficultyFilter, statusFilter, hasEventsFilter, hasCommunitiesFilter, trackStats]);


  const canEdit = role === 'super-admin';
  const canCreate = role === 'super-admin';

  const handleArchive = async (trackId: string, trackName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${trackName}"?`
    );

    if (!confirmed) return;

    try {
      setArchivingId(trackId);

      await archiveTrack(trackId);

      toast.success(t('tracks.toasts.archiveSuccess'));
      fetchTracks();

    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('tracks.toasts.archiveError'));
    } finally {
      setArchivingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10B981';
      case 'limited': return '#F59E0B';
      case 'closed': return '#EF4444';
      default: return '#999';
    }
  };

  const handleDelete = (trackId: string) => {
    setTrackToDelete(trackId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (trackToDelete) {
      deleteTrack(trackToDelete);
      toast.success(t('tracks.toasts.deleteSuccess'));
      setShowDeleteModal(false);
      setTrackToDelete(null);
    }
  };


  const cities = Array.from(new Set(tracks.map(t => t.city))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('tracks.title')}</h1>
          <p style={{ color: '#666' }}>{t('tracks.subtitle')}</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate(`/tracks/create`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>{t('tracks.createButton')}</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.totalTracks')}</p>
          <p className="text-2xl" style={{ color: '#333' }}>{tracks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.openTracks')}</p>
          <p className="text-2xl" style={{ color: '#10B981' }}>{tracks.filter(t => t.status === 'Open').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.citiesCovered')}</p>
          <p className="text-2xl" style={{ color: '#333' }}>{cities.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('tracks.totalDistance')}</p>
          <p className="text-2xl" style={{ color: '#333' }}>{tracks.reduce((sum, t) => sum + t.distance, 0)} {t('common.km')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
              <input
                type="text"
                placeholder={t('tracks.filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('tracks.filters.allCities')}</option>
              {cities.map(city => (
                <option key={city} value={city}>{t(`data.locations.${city}`, String(city))}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('tracks.filters.allStatus')}</option>
              <option value="Open">{t('tracks.filters.open')}</option>
              <option value="Limited">{t('tracks.filters.limited')}</option>
              <option value="Closed">{t('tracks.filters.closed')}</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('tracks.filters.allDifficulty')}</option>
              <option value="Easy">{t('tracks.filters.easy')}</option>
              <option value="Medium">{t('tracks.filters.medium')}</option>
              <option value="Hard">{t('tracks.filters.hard')}</option>
            </select>
          </div>

          {/* Has Events Filter */}
          <div>
            <select
              value={hasEventsFilter}
              onChange={(e) => setHasEventsFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('tracks.filters.hasEvents')}</option>
              <option value="yes">{t('tracks.filters.yes')}</option>
              <option value="no">{t('tracks.filters.no')}</option>
            </select>
          </div>
        </div>

        {/* Additional Filter Row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Has Communities Filter */}
          <div>
            <select
              value={hasCommunitiesFilter}
              onChange={(e) => setHasCommunitiesFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">{t('tracks.filters.hasCommunities')}</option>
              <option value="yes">{t('tracks.filters.yes')}</option>
              <option value="no">{t('tracks.filters.no')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track, index) => {
              const trackId = getTrackId(track);
              const stats = trackId ? trackStats[trackId] : null;
              const eventsCount = stats?.eventsCount || 0;
              const communitiesCount = stats?.communitiesCount || 0;

              return (
                <div key={trackId ?? track.id ?? `track-${index}`} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-40 h-32 rounded-lg overflow-hidden">
                      <img src={track.image || track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className="text-xl cursor-pointer hover:underline"
                              style={{ color: '#333' }}
                              onClick={() => trackId && navigate(`/tracks/${trackId}`)}
                            >
                              {track.title}
                            </h3>
                            <span
                              className="px-3 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: getStatusColor(track.status) }}
                            >
                              {t(`data.statuses.${track.status}`, track.status)}
                            </span>
                            <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                              {t(`data.trackTypes.${track.trackType}`, track.trackType)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#666' }}>{track.area}, {t(`data.locations.${track.city}`, track.city)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.distance')}</div>
                          <div className="text-sm" style={{ color: '#333' }}>{track.distance} {t('common.km')}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.difficulty')}</div>
                          <span
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: getDifficultyColor(track.difficulty) }}
                          >
                            {track.difficulty ? t(`data.difficulties.${track.difficulty}`, track.difficulty) : t('tracks.card.na')}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.surface')}</div>
                          <div className="text-sm" style={{ color: '#333' }}>{t(`data.surfaceTypes.${track.surfaceType}`, track.surfaceType)}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.events')}</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#333' }}>{eventsCount}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.communities')}</div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" style={{ color: '#999' }} />
                            <span className="text-sm" style={{ color: '#333' }}>{communitiesCount}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: '#999' }}>{t('tracks.card.lastUpdated')}</div>
                          <div className="text-sm" style={{ color: '#333' }}>
                            {track.updatedAt
                              ? new Date(track.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => trackId && navigate(`/tracks/${trackId}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                          style={{ backgroundColor: '#ECC180', color: '#333' }}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{t('tracks.card.view')}</span>
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => trackId && navigate(`/tracks/${trackId}/edit`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                              style={{ backgroundColor: '#3B82F6', color: '#fff' }}
                            >
                              <Edit className="w-4 h-4" />
                              <span className="text-sm">{t('tracks.card.edit')}</span>
                            </button>
                            <button
                              onClick={() => trackId && handleArchive(trackId, track.title)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                              style={{ color: '#666' }}
                            >
                              <Archive className="w-4 h-4" />
                              <span className="text-sm">{t('tracks.card.archive')}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white">
              <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <p className="text-lg mb-2" style={{ color: '#666' }}>{t('tracks.empty.noResults')}</p>
              <p className="text-sm" style={{ color: '#999' }}>{t('tracks.empty.tryFilters')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
