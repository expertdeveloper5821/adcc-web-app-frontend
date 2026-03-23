import React, { useEffect, useMemo, useState } from 'react';
import { Send, Users, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { sendStaffWebPush } from '../../services/authApi';

export function PushNotifications() {
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

  const payload = useMemo(
    () => ({
      title: title.trim() || undefined,
      body: message.trim(),
      audienceType: audience,
    }),
    [title, message, audience]
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
        toast.error('Message is required');
        return;
      }
      const response = await sendStaffWebPush(payload);
      setLastResponse(JSON.stringify(response, null, 2));
      toast.success('Push notification sent');
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

  useEffect(() => {
    void refreshDebugInfo();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Push Notifications</h1>
        <p style={{ color: '#666' }}>Send notifications to app users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Create Campaign</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Title</label>
              <input
                type="text"
                placeholder="Notification title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message</label>
              <textarea
                placeholder="Notification message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Audience</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="all">All Users (12,458)</option>
                <option value="active">Active Users (8,234)</option>
                <option value="event">Event Participants</option>
                <option value="chapter">Chapter Members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Schedule</label>
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
              <span>{isSending ? 'Sending...' : 'Send Notification'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Preview</h2>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="text-sm mb-2" style={{ color: '#333' }}>
              {title.trim() || 'Notification Title'}
            </div>
            <p className="text-xs" style={{ color: '#666' }}>
              {message.trim() || 'Your message will appear here...'}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm mb-2 font-semibold" style={{ color: '#333' }}>Last Response</h3>
            <pre className="text-xs p-3 rounded-lg bg-gray-50 border border-gray-200 whitespace-pre-wrap">
              {lastResponse || 'No response yet'}
            </pre>
          </div>

          <div className="mt-4">
            <h3 className="text-sm mb-2 font-semibold" style={{ color: '#333' }}>Last Error</h3>
            <pre className="text-xs p-3 rounded-lg bg-gray-50 border border-gray-200 whitespace-pre-wrap">
              {lastError || 'No error'}
            </pre>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: '#333' }}>Debug Panel</h3>
              <button
                onClick={refreshDebugInfo}
                className="text-xs px-3 py-1 rounded border border-gray-200"
                style={{ color: '#333', backgroundColor: '#fff' }}
              >
                Refresh
              </button>
            </div>
            <div className="text-xs p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <div>Notification permission: {permission}</div>
              <div>Service worker: {swStatus}</div>
              <div>FCM token: {fcmToken ? `${fcmToken.slice(0, 12)}...` : 'missing'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
