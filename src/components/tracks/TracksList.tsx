import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, Users, Edit, Eye, Archive } from 'lucide-react';
import { UserRole } from '../../App';
import { toast } from 'sonner@2.0.3';
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

      const results = await getAllTracks();

      const list =
        Array.isArray(results)
          ? results
          : results?.tracks || results?.data?.tracks || results?.data || [];

      setTracks(Array.isArray(list) ? list : []);
    }
    catch (err) {
      console.log(err);
      setTracks([]);
      setError('Failed to load tracks. Please try again later.');

    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [eventsRes, communitiesRes] = await Promise.all([
          getAllEvents(),          // use service version, not data file
          getAllCommunities(),     // use service version
        ]);

        const eventsList =
          eventsRes?.events || eventsRes?.data?.events || eventsRes || [];

        const communitiesList =
          communitiesRes?.communities || communitiesRes?.data?.communities || communitiesRes || [];

        setEvents(Array.isArray(eventsList) ? eventsList : []);
        setCommunities(Array.isArray(communitiesList) ? communitiesList : []);
      } catch (err) {
        toast.error("Failed to load events or communities");
      }
    };

    fetchMeta();
  }, []);

  const getTrackId = (track: any): string | null => {
    if (!track) return null;
    if (typeof track === "string") return track;
    return track._id || track.id || null;
  };


  const trackStats = useMemo(() => {
    const stats: Record<string, { eventsCount: number; communitiesCount: number }> = {};

    // Count events
    events.forEach((event) => {
      const trackId = getTrackId(event.trackId);
      if (!trackId) return;

      if (!stats[trackId]) {
        stats[trackId] = { eventsCount: 0, communitiesCount: 0 };
      }

      stats[trackId].eventsCount += 1;
    });

    // Count communities
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

  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      // const trackId = (track.id ?? track._id ?? '' ).toString();
      const name = (track.title ?? track.title ?? '').toString();
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
  }, [tracks, searchTerm, cityFilter, difficultyFilter, statusFilter]);


  const canEdit = role === 'super-admin';
  const canCreate = role === 'super-admin';

  const handleArchive = async (trackId: string, trackName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive herrr"${trackName}"?`
    );

    if (!confirmed) return;

    try {
      setArchivingId(trackId);

      await archiveTrack(trackId);

      toast.success('Track archived successfully');
      fetchTracks();

    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to archive');
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
      toast.success('Track deleted successfully');
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
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Tracks</h1>
          <p style={{ color: '#666' }}>Manage cycling routes and tracks across the GCC</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate(`/tracks/create`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Track</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Total Tracks</p>
          <p className="text-2xl" style={{ color: '#333' }}>{tracks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Open Tracks</p>
          <p className="text-2xl" style={{ color: '#10B981' }}>{tracks.filter(t => t.status === 'Open').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Cities Covered</p>
          <p className="text-2xl" style={{ color: '#333' }}>{cities.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Total Distance</p>
          <p className="text-2xl" style={{ color: '#333' }}>{tracks.reduce((sum, t) => sum + t.distance, 0)} km</p>
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
                placeholder="Search tracks..."
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
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
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
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Limited">Limited</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Has Events Filter */}
          <div>
            <select
              value={hasEventsFilter}
              onChange={(e) => setHasEventsFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">Has Events</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
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
              <option value="all">Has Communities</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        {filteredTracks.length > 0 ? (
          filteredTracks.map(track => {

            const trackId = getTrackId(track);
            const stats = trackId ? trackStats[trackId] : null;

            const eventsCount = stats?.eventsCount || 0;
            const communitiesCount = stats?.communitiesCount || 0;

            return (
              <div key={track.id} className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-40 h-32 rounded-lg overflow-hidden">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-xl cursor-pointer hover:underline"
                            style={{ color: '#333' }}
                            onClick={() => navigate(`/tracks/${track._id}` )}
                          >
                            {track.title}
                          </h3>
                          <span
                            className="px-3 py-1 rounded-full text-xs text-white"
                            style={{ backgroundColor: getStatusColor(track.status) }}
                          >
                            {track.status}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#ECC180', color: '#333' }}
                          >
                            {track.trackType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#666' }}>{track.area}, {track.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Distance</div>
                        <div className="text-sm" style={{ color: '#333' }}>{track.distance} km</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Difficulty</div>
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: getDifficultyColor(track.difficulty) }}
                        >
                          {track.difficulty ? track.difficulty : 'NA'}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Surface</div>
                        <div className="text-sm" style={{ color: '#333' }}>{track.surfaceType}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Events</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>
                            {eventsCount}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Communities</div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" style={{ color: '#999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>{communitiesCount}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#999' }}>Last Updated</div>
                        <div className="text-sm" style={{ color: '#333' }}>
                          {new Date(track.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/tracks/${track._id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                        style={{ backgroundColor: '#ECC180', color: '#333' }}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => navigate(`/tracks/${track._id}/edit`)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                            style={{ backgroundColor: '#3B82F6', color: '#fff' }}
                          >
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleArchive(track._id, track.title)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                            style={{ color: '#666' }}
                          >
                            <Archive className="w-4 h-4" />
                            <span className="text-sm">Archive</span>
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
            <p className="text-lg mb-2" style={{ color: '#666' }}>No tracks found</p>
            <p className="text-sm" style={{ color: '#999' }}>Try adjusting your filters or create a new track</p>
          </div>
        )}
      </div>
    </div>
  );
}