import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Download, UserX, Check, X } from 'lucide-react';
import { getEventResults, checkInParticipant, markParticipantNoShow, checkInAllParticipants, markAllParticipantsNoShow, removeEventParticipant, exportEventResultsCsv } from '../../services/eventsApi';
import { toast } from 'sonner';
import { UserRole } from '../../App';
// import { getparticipants } from '../../services/eventsApi';
interface EventParticipantsProps {
  navigate?: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventParticipants({ role }: EventParticipantsProps) {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [participantsData, setParticipantsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const normalizeStatus = (s: string | undefined) => {
    if (!s) return 'registered';
    return String(s).toLowerCase().replace(/_/g, '-');
  };

  const mapResultsFromBackend = (resultsData: any[]) =>
    (Array.isArray(resultsData) ? resultsData : []).map((p: any) => ({
      id: p._id || p.id,
      userId: p.user?._id || p.userId,
      userName: p.user?.fullName || p.userName || '-',
      userCommunity: p.user?.email || p.userCommunity || '-',
      status: normalizeStatus(p.status),
      registeredAt: p.createdAt || p.registeredAt || null,
      checkedInAt: p.checkedInAt || null,
      rank: p.rank,
      time: p.time,
    }));

  const fetchParticipants = React.useCallback(async (silent = false) => {
    if (!eventId || eventId === 'undefined') {
      setIsLoading(false);
      return;
    }
    try {
      if (!silent) setIsLoading(true);
      const resultsData = await getEventResults(eventId);
      setParticipantsData(mapResultsFromBackend(resultsData));
    } catch (error) {
      toast.error('Failed to load event participants');
      console.error(error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p className="text-center py-8" style={{ color: '#666' }}>Loading participants...</p>
      </div>
    );
  }

  const filteredParticipants = participantsData.filter(participant => {
    const userName = (participant.userName || '').toLowerCase();
    const userCommunity = (participant.userCommunity || '').toLowerCase();
    const matchesSearch = userName.includes(searchQuery.toLowerCase()) ||
                         userCommunity.includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || participant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = async (participantId: string) => {
    const target = participantsData.find((p) => p.id === participantId);
    if (!target || !target.userId || !eventId) return;
    try {
      await checkInParticipant(eventId, target.userId);
      await fetchParticipants(true);
      toast.success('Participant checked in');
    } catch (error) {
      console.error('Error checking in participant:', error);
      toast.error('Failed to check in participant');
    }
  };

  const handleMarkNoShow = async (participantId: string) => {
    const target = participantsData.find((p) => p.id === participantId);
    if (!target || !target.userId || !eventId) return;
    try {
      await markParticipantNoShow(eventId, target.userId);
      await fetchParticipants(true);
      toast.success('Marked as no-show');
    } catch (error) {
      console.error('Error marking participant no-show:', error);
      toast.error('Failed to mark no-show');
    }
  };

  const handleRemoveParticipant = async (participantId: string, userName: string) => {
    if (!eventId) return;
    if (!confirm(`Remove ${userName} from this event?`)) return;

    try {
      const target = participantsData.find((p) => p.id === participantId);
      const userId = target?.userId;
      if (!userId) return;

      await removeEventParticipant(eventId, userId);
      await fetchParticipants(true);
      toast.success('Participant removed');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const handleExportCSV = async () => {
    if (!eventId || eventId === 'undefined') {
      toast.error('Cannot export results: invalid event');
      return;
    }

    try {
      const blob = await exportEventResultsCsv(eventId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-${eventId}-results.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (error) {
      console.error('Error exporting results CSV:', error);
      toast.error('Failed to export results');
    }
  };

  const stats = {
    total: participantsData.length,
    registered: participantsData.filter(p => !p.status || p.status === 'registered').length,
    checkedIn: participantsData.filter(p => p.status === 'checked-in').length,
    completed: participantsData.filter(p => p.status === 'completed').length,
    noShow: participantsData.filter(p => p.status === 'no-show').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Participant Management</h1>
          <p style={{ color: '#666' }}>{event.title || event.name}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:shadow-md"
          style={{ backgroundColor: '#ECC180', color: '#333' }}
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Total</p>
          <p className="text-2xl" style={{ color: '#333' }}>{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Registered</p>
          <p className="text-2xl" style={{ color: '#3B82F6' }}>{stats.registered}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Checked In</p>
          <p className="text-2xl" style={{ color: '#10B981' }}>{stats.checkedIn}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>Completed</p>
          <p className="text-2xl" style={{ color: '#F59E0B' }}>{stats.completed}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>No-Show</p>
          <p className="text-2xl" style={{ color: '#EF4444' }}>{stats.noShow}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search by name or community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              style={{ color: '#333' }}
            />
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              style={{ color: '#333' }}
            >
              <option value="">All Status</option>
              <option value="registered">Registered</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="no-show">No-Show</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#666' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="p-6 rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Name</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Community</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Status</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Registered At</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Checked In</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Rank</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>Time</th>
              <th className="text-right py-3 px-4" style={{ color: '#666' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(participant => (
              <tr key={participant._id || participant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4" style={{ color: '#333' }}>{participant.user?.fullName || participant.userName || '-'}</td>
                <td className="py-3 px-4" style={{ color: '#666' }}>{participant.user?.email || participant.userCommunity || '-'}</td>
                <td className="py-3 px-2">
                  <span
                    className="px-0 py-1 rounded-full text-xs capitalize text-white"
                    style={{
                      backgroundColor:
                        participant.status === 'checked-in' ? '#10B981' :
                        participant.status === 'no-show' ? '#EF4444' :
                        participant.status === 'completed' ? '#F59E0B' :
                        participant.status === 'registered' || participant.status === 'joined' ? '#3B82F6' : '#6B7280',
                    }}
                  >
                    {participant.status || 'registered'}
                  </span>
                </td>
                <td className="py-3 px-4" style={{ color: '#666' }}>
                  {participant.createdAt ? new Date(participant.createdAt).toLocaleDateString() : participant.registeredAt ? new Date(participant.registeredAt).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4" style={{ color: '#666' }}>
                  {participant.checkedInAt ? new Date(participant.checkedInAt).toLocaleString() : '-'}
                </td>
                <td className="py-3 px-4" style={{ color: '#333' }}>
                  {participant.rank ? `#${participant.rank}` : '-'}
                </td>
                <td className="py-3 px-4" style={{ color: '#333' }}>
                  {participant.time || '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    
                      <button
                        onClick={() => handleCheckIn(participant.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-green-50"
                        title="Check In"
                      >
                        <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                      </button>
                   

                    
                      <button
                        onClick={() => handleMarkNoShow(participant.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        title="Mark No-Show"
                      >
                        <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                      </button>
                   

                    <button
                      onClick={() => handleRemoveParticipant(participant.id, participant.userName)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-50"
                      title="Remove Participant"
                    >
                      <UserX className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center" style={{ color: '#999' }}>
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {filteredParticipants.length > 0 && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#10B981', color: '#fff' }}
              onClick={async () => {
                if (!eventId) return;
                try {
                  await checkInAllParticipants(eventId);
                  await fetchParticipants(true);
                  toast.success('All registered participants checked in');
                } catch (error) {
                  console.error('Error checking in all participants:', error);
                  toast.error('Failed to check in all participants');
                }
              }}
            >
              Check In All Registered
            </button>
            <button
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#EF4444', color: '#fff' }}
              onClick={async () => {
                if (!eventId) return;
                try {
                  await markAllParticipantsNoShow(eventId);
                  await fetchParticipants(true);
                  toast.success('All applicable participants marked as no-show');
                } catch (error) {
                  console.error('Error marking all no-show:', error);
                  toast.error('Failed to mark all no-show');
                }
              }}
            >
              Mark All No-Show
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Export Filtered List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
