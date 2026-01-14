import React, { useState } from 'react';
import { Plus, Search, MapPin, Users, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllTracks, deleteTrack } from '../../data/tracksData';
import { toast } from 'sonner@2.0.3';

interface TracksListProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function TracksList({ navigate, role }: TracksListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);

  const tracks = getAllTracks();

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || track.city === cityFilter;
    const matchesDifficulty = difficultyFilter === 'all' || track.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || track.status === statusFilter;
    return matchesSearch && matchesCity && matchesDifficulty && matchesStatus;
  });

  const canEdit = role === 'super-admin';
  const canCreate = role === 'super-admin';

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#CF9F0C';
      case 'Medium': return '#E1C06E';
      case 'Hard': return '#C12D32';
      default: return '#999';
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'High': return '#CF9F0C';
      case 'Medium': return '#E1C06E';
      case 'Low': return '#C12D32';
      default: return '#999';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Tracks</h1>
          <p style={{ color: '#666' }}>Manage cycling routes and tracks</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('track-create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Track</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
              <input
                type="text"
                placeholder="Search tracks..."
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
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Tracks Table/Card Hybrid */}
      <div className="space-y-4">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-6">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl mb-1" style={{ color: '#333' }}>{track.name}</h3>
                    <p className="text-sm" style={{ color: '#666' }}>{track.shortDescription}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: track.status === 'Active' ? '#CF9F0C' : '#999' }}
                  >
                    {track.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#999' }}>City</div>
                    <div className="flex items-center gap-1 text-sm" style={{ color: '#333' }}>
                      <MapPin className="w-4 h-4" />
                      <span>{track.city}</span>
                    </div>
                  </div>
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
                      {track.difficulty}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#999' }}>Safety Level</div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" style={{ color: getSafetyColor(track.safetyLevel) }} />
                      <span className="text-sm" style={{ color: '#333' }}>{track.safetyLevel}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#999' }}>Events</div>
                    <div className="text-sm" style={{ color: '#333' }}>{track.eventsCount}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#999' }}>Surface</div>
                    <div className="text-sm" style={{ color: '#333' }}>{track.surfaceType}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('track-detail', { selectedTrackId: track.id })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View</span>
                  </button>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => navigate('track-detail', { selectedTrackId: track.id })}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" style={{ color: '#666' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Track</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete this track? This action cannot be undone.
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
