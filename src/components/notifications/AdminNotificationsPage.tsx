import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, CheckCircle, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '../../contexts/LocaleContext';
import {
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from '../../services/adminNotificationsApi';

function formatRelativeTime(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const lang = locale === 'ar' ? 'ar' : 'en';
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (diffSec < 60) return rtf.format(-Math.max(diffSec, 0), 'second');
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return rtf.format(-diffDay, 'day');
  return d.toLocaleDateString(lang);
}

function iconForNotification(type: string): { Icon: LucideIcon; bg: string; color: string } {
  const t = type.toLowerCase();
  if (
    t.includes('event') ||
    t.includes('calendar') ||
    t.includes('registration') ||
    t.includes('register')
  ) {
    return { Icon: Calendar, bg: '#E8F0FE', color: '#1A73E8' };
  }
  if (t.includes('challenge') || t.includes('trophy') || t.includes('complete')) {
    return { Icon: Trophy, bg: '#FDECEA', color: '#C12D32' };
  }
  if (
    t.includes('community') ||
    t.includes('member') ||
    t.includes('people') ||
    t.includes('user')
  ) {
    return { Icon: Users, bg: '#E6F4EA', color: '#1E8E3E' };
  }
  if (t.includes('system') || t.includes('update') || t.includes('success')) {
    return { Icon: CheckCircle, bg: '#F1F3F4', color: '#5F6368' };
  }
  return { Icon: Bell, bg: '#F1F3F4', color: '#5F6368' };
}

export function AdminNotificationsPage() {
  const { t } = useTranslation();
  const { locale, isRtl } = useLocale();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, unread] = await Promise.all([
        getAdminNotifications(50),
        getAdminUnreadNotificationCount(),
      ]);
      setItems(list);
      setUnreadCount(unread);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('topbar.notifications.loadError'));
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAdminNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('topbar.notifications.markAllError'));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemClick = async (n: AdminNotification) => {
    if (n.read) return;
    try {
      await markAdminNotificationRead(n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('topbar.notifications.markOneError'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`flex items-center justify-between mb-6 flex-wrap gap-4 ${
          isRtl ? 'flex-row-reverse' : ''
        }`}
      >
        <h1 className="text-2xl font-semibold" style={{ color: '#333' }}>
          {t('topbar.notifications.title')}
        </h1>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          style={{ color: '#C12D32' }}
        >
          {t('topbar.notifications.markAllRead')}
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFBF5' }}>
        {loading && (
          <div className="px-4 py-12 text-center text-sm" style={{ color: '#999' }}>
            {t('common.loading')}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="px-4 py-12 text-center text-sm" style={{ color: '#999' }}>
            {t('topbar.notifications.empty')}
          </div>
        )}
        {!loading &&
          items.map((n) => {
            const { Icon, bg, color } = iconForNotification(n.type);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => void handleItemClick(n)}
                className={`w-full text-left px-4 py-4 flex gap-3 border-b border-amber-50/50 last:border-0 transition-colors hover:bg-white/60 ${
                  n.read ? 'bg-white' : ''
                } ${isRtl ? 'flex-row-reverse text-right' : ''}`}
                style={!n.read ? { backgroundColor: 'rgba(236, 193, 128, 0.25)' } : undefined}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug" style={{ color: '#333' }}>
                    {n.title}
                  </div>
                  {n.description ? (
                    <div className="text-sm mt-1 leading-snug" style={{ color: '#666' }}>
                      {n.description}
                    </div>
                  ) : null}
                  <div className="text-xs mt-1" style={{ color: '#999' }}>
                    {formatRelativeTime(n.createdAt, locale)}
                  </div>
                </div>
                {!n.read && (
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-2 self-start"
                    style={{ backgroundColor: '#C12D32' }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
