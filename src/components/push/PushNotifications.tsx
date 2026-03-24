import React, { useEffect, useMemo, useState } from 'react';
import { Send, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner@2.0.3';
import { sendStaffWebPush } from '../../services/authApi';
import { getAllUsers } from '../../services/usersApi';
import { getAllEvents } from '../../services/eventsApi';
//import { getAllCommunities } from '../../services/communitiesApi';

interface AudienceCounts {
  all: number;
  active: number;
  eventParticipants: number;
  chapterMembers: number;
}

export function PushNotifications() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [audience, setAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');
  const [permission, setPermission] = useState<string>('unknown');
  const [swStatus, setSwStatus] = useState<string>('unknown');
  const [fcmToken, setFcmToken] = useState<string>('');
  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts>({
    all: 0,
    active: 0,
    eventParticipants: 0,
    chapterMembers: 0,
  });

  const payload = useMemo(
    () => ({
      title: title.trim() || undefined,
      body: message.trim(),
      audienceType: audience,
      scheduleDate: scheduleDate || undefined,
      scheduleTime: scheduleTime || undefined,
    }),
    [title, message, audience, scheduleDate, scheduleTime]
  );

  const handleSend = async () => {
    console.log('🟢 Send button clicked');
    console.log('📤 Push payload:', payload);
    if (isSending) return;
    setIsSending(true);
    setLastResponse('');
    setLastError('');
    try {
      if (!payload.body) {
        toast.error(t('push.message'));
        return;
      }
      const response = await sendStaffWebPush(payload);
      setLastResponse(JSON.stringify(response, null, 2));
      toast.success(t('push.toasts.sent'));
    } catch (error: any) {
      const errorPayload = error?.response?.data || { message: error?.message || 'Unknown error' };
      setLastError(JSON.stringify(errorPayload, null, 2));
      toast.error(errorPayload?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const refreshDebugInfo = async () => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFcmSw = registrations.some((reg) =>
          reg.active?.scriptURL?.includes('firebase-messaging-sw.js')
        );
        setSwStatus(hasFcmSw ? 'active' : registrations.length > 0 ? 'registered' : 'none');
      } catch {
        setSwStatus('error');
      }
    } else {
      setSwStatus('unsupported');
    }

    const token = localStorage.getItem('fcmToken') || '';
    setFcmToken(token);
  };

  const fetchAudienceCounts = async () => {
    try {
      const [allUsersRes, events] = await Promise.all([
        getAllUsers(1, 1),
        getAllEvents({ page: 1, limit: 100 }),
        // getAllCommunities(),
      ]);

      const totalUsers = allUsersRes.pagination.total;

      // Active users: users with isVerified = true
      const verifiedRes = await getAllUsers(1, 100);
      const activeCount = verifiedRes.users.filter((u) => u.isVerified).length;
      // If total users > 100, scale proportionally
      const estimatedActive =
        totalUsers > 100
          ? Math.round((activeCount / verifiedRes.users.length) * totalUsers)
          : activeCount;

      // Event participants: sum of registrations across all events
      const eventParticipants = events.reduce((sum, e) => sum + (e.registrations ?? 0), 0);

      // Chapter members: sum of memberCount across all communities
      // const chapterMembers = communities.reduce(
      //   (sum, c) => sum + (Number(c.memberCount) || c.stats?.members || 0),
      //   0
      // );

      setAudienceCounts({
        all: totalUsers,
        active: estimatedActive,
        eventParticipants,
        //chapterMembers,
      });
    } catch (err) {
      console.error('Failed to fetch audience counts:', err);
    }
  };

  useEffect(() => {
    void refreshDebugInfo();
    void fetchAudienceCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('push.title')}</h1>
        <p style={{ color: '#666' }}>{t('push.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('push.createCampaign')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.campaignTitle')}</label>
              <input
                type="text"
                placeholder={t('push.titlePlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.message')}</label>
              <textarea
                placeholder={t('push.messagePlaceholder')}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.audience')}</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="all">{t('push.audienceOptions.allUsers', { count: audienceCounts.all.toLocaleString() })}</option>
                <option value="active">{t('push.audienceOptions.activeUsers', { count: audienceCounts.active.toLocaleString() })}</option>
                <option value="event">{t('push.audienceOptions.eventParticipants', { count: audienceCounts.eventParticipants.toLocaleString() })}</option>
                {/* <option value="chapter">{t('push.audienceOptions.chapterMembers', { count: audienceCounts.chapterMembers.toLocaleString() })}</option> */}
                <option value="chapter">Chapter Members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>{t('push.schedule')}</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-200"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <input
                  type="time"
                  className="px-4 py-2 rounded-lg border border-gray-200"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white"
              style={{ backgroundColor: '#C12D32', opacity: isSending ? 0.7 : 1 }}
            >
              <Send className="w-5 h-5" />
              <span>{isSending ? t('push.sending') : t('push.sendNotification')}</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('push.preview')}</h2>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="text-sm mb-2" style={{ color: '#333' }}>
              {title.trim() || t('push.previewTitle')}
            </div>
            <p className="text-xs" style={{ color: '#666' }}>
              {message.trim() || t('push.previewBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
