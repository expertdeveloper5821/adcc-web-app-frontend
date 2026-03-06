import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Download, UserX, Check, X } from 'lucide-react';
import { getEventById } from '../../services/eventsApi';
import { getEventResults } from '../../services/eventsApi';
import { toast } from 'sonner@2.0.3';
import { UserRole } from '../../App';

interface EventParticipantsProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

export function EventParticipants({ role }: EventParticipantsProps) {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventData, resultsData] = await Promise.all([
          getEventById(id),
          getEventResults(id),
        ]);
        setEvent(eventData);
        setParticipants(resultsData);
      } catch (error) {
        toast.error(t('events.participants.toasts.loadError'));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-8" style={{ color: '#666' }}>{t('events.participants.loadingParticipants')}</div>;
  }

  if (!event) {
    return (
      <div className="p-6 rounded-2xl bg-white">
        <p style={{ color: '#666' }}>{t('events.detail.notFound')}</p>
      </div>
    );
  }

  const filteredParticipants = (participants || []).filter(participant => {
    const userName = participant.user?.fullName || participant.userName || '';
    const userEmail = participant.user?.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || participant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (participantId: string) => {
    // TODO: Implement API call to update participant status
    toast.success(t('events.participants.toasts.checkInSuccess'));
  };

  const handleMarkNoShow = (participantId: string) => {
    // TODO: Implement API call to update participant status
    toast.success(t('events.participants.toasts.noShowSuccess'));
  };

  const handleRemoveParticipant = (participantId: string, userName: string) => {
    // TODO: Implement API call to remove participant
    toast.success(t('events.participants.toasts.removeSuccess'));
  };

  const handleExportCSV = () => {
    toast.success(t('events.participants.toasts.exportSuccess'));
  };

  const stats = {
    total: (participants || []).length,
    registered: (participants || []).filter(p => !p.status || p.status === 'registered').length,
    checkedIn: (participants || []).filter(p => p.status === 'checked-in').length,
    completed: (participants || []).filter(p => p.status === 'completed').length,
    noShow: (participants || []).filter(p => p.status === 'no-show').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('event-detail', { selectedEventId: eventId })}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('events.participants.title')}</h1>
          <p style={{ color: '#666' }}>{event.name}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:shadow-md"
          style={{ backgroundColor: '#ECC180', color: '#333' }}
        >
          <Download className="w-5 h-5" />
          {t('events.participants.exportCSV')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.participants.total')}</p>
          <p className="text-2xl" style={{ color: '#333' }}>{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.participants.registered')}</p>
          <p className="text-2xl" style={{ color: '#3B82F6' }}>{stats.registered}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.participants.checkedIn')}</p>
          <p className="text-2xl" style={{ color: '#10B981' }}>{stats.checkedIn}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.participants.completed')}</p>
          <p className="text-2xl" style={{ color: '#F59E0B' }}>{stats.completed}</p>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm mb-1" style={{ color: '#666' }}>{t('events.participants.noShow')}</p>
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
              placeholder={t('events.participants.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t('events.participants.allStatus')}</option>
              <option value="registered">{t('events.participants.registered')}</option>
              <option value="checked-in">{t('events.participants.checkedIn')}</option>
              <option value="completed">{t('events.participants.completed')}</option>
              <option value="no-show">{t('events.participants.noShow')}</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#666' }}
            >
              {t('events.participants.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="p-6 rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.name')}</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.community')}</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.status')}</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.registeredAt')}</th>
              <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.checkedIn')}</th>
              {event.category === 'Race' && (
                <>
                  <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.rank')}</th>
                  <th className="text-left py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.time')}</th>
                </>
              )}
              <th className="text-right py-3 px-4" style={{ color: '#666' }}>{t('events.participants.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(participant => (
              <tr key={participant._id || participant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4" style={{ color: '#333' }}>{participant.user?.fullName || participant.userName || '-'}</td>
                <td className="py-3 px-4" style={{ color: '#666' }}>{participant.user?.email || participant.userCommunity || '-'}</td>
                <td className="py-3 px-4">
                  <span
                    className="px-2 py-1 rounded-full text-xs capitalize text-white"
                    style={{
                      backgroundColor:
                        participant.status === 'registered' ? '#3B82F6' :
                        participant.status === 'checked-in' ? '#10B981' :
                        participant.status === 'completed' ? '#F59E0B' : '#EF4444'
                    }}
                  >
                    {participant.status || 'registered'}
                  </span>
                </td>
                <td className="py-3 px-4" style={{ color: '#666' }}>
                  {new Date(participant.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4" style={{ color: '#666' }}>
                  {participant.checkedInAt ? new Date(participant.checkedInAt).toLocaleString() : '-'}
                </td>
                {event.category === 'Race' && (
                  <>
                    <td className="py-3 px-4" style={{ color: '#333' }}>
                      {participant.rank ? `#${participant.rank}` : '-'}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#333' }}>
                      {participant.time || '-'}
                    </td>
                  </>
                )}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    {(!participant.status || participant.status === 'registered') && (
                      <button
                        onClick={() => handleCheckIn(participant._id || participant.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-green-50"
                        title={t('events.participants.checkIn')}
                      >
                        <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                      </button>
                    )}

                    {(!participant.status || participant.status === 'registered') && (
                      <button
                        onClick={() => handleMarkNoShow(participant._id || participant.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        title={t('events.participants.markNoShow')}
                      >
                        <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveParticipant(participant._id || participant.id, participant.user?.fullName || participant.userName || 'Participant')}
                      className="p-2 rounded-lg transition-colors hover:bg-red-50"
                      title={t('events.participants.removeParticipant')}
                    >
                      <UserX className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={event.category === 'Race' ? 8 : 6} className="py-12 text-center" style={{ color: '#999' }}>
                  {t('events.participants.noParticipants')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {filteredParticipants.length > 0 && (
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('events.participants.bulkActions')}</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#10B981', color: '#fff' }}
            >
              {t('events.participants.checkInAll')}
            </button>
            <button
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#EF4444', color: '#fff' }}
            >
              {t('events.participants.markAllNoShow')}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              {t('events.participants.exportFiltered')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
