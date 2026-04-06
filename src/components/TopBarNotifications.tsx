import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  Trophy,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '../contexts/LocaleContext';
import {
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from '../services/adminNotificationsApi';

interface TopBarNotificationsProps {
  isRtl: boolean;
}

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

export function TopBarNotifications({ isRtl }: TopBarNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const refreshUnread = useCallback(async () => {
    try {
      const n = await getAdminUnreadNotificationCount();
      setUnreadCount(n);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await getAdminNotifications(10);
      setItems(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('topbar.notifications.loadError'));
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, [t]);

  useEffect(() => {
    void refreshUnread();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshUnread();
    }, 60000);
    return () => window.clearInterval(id);
  }, [refreshUnread]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      void loadList();
      void refreshUnread();
    }
  }, [open, loadList, refreshUnread]);

  const handleToggle = () => setOpen((v) => !v);

  const handleMarkAllRead = async () => {
    if (markingAll) return;
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

  const badge =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('topbar.notifications.title')}
      >
        <Bell className="w-6 h-6" style={{ color: '#333' }} />
        {badge !== null && (
          <span
            className="absolute -top-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: '#C12D32', [isRtl ? 'left' : 'right']: '-2px' }}
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 w-[min(100vw-2rem,380px)] rounded-xl shadow-lg border border-gray-100 z-[60] overflow-hidden ${
            isRtl ? 'left-0' : 'right-0'
          }`}
          style={{ backgroundColor: '#FFFBF5' }}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b border-amber-100/80 ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="text-sm font-semibold" style={{ color: '#333' }}>
              {t('topbar.notifications.title')}
            </span>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
              style={{ color: '#C12D32' }}
            >
              {t('topbar.notifications.markAllRead')}
            </button>
          </div>

          <div className="max-h-[min(70vh,420px)] overflow-y-auto">
            {loadingList && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: '#999' }}>
                {t('common.loading')}
              </div>
            )}
            {!loadingList && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: '#999' }}>
                {t('topbar.notifications.empty')}
              </div>
            )}
            {!loadingList &&
              items.map((n) => {
                const { Icon, bg, color } = iconForNotification(n.type);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 border-b border-amber-50/50 last:border-0 transition-colors hover:bg-white/60 ${
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
                        <div className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: '#666' }}>
                          {n.description}
                        </div>
                      ) : null}
                      <div className="text-[11px] mt-1" style={{ color: '#999' }}>
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

          <div className="border-t border-amber-100/80 py-2.5 px-4 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: '#C12D32' }}
            >
              {t('topbar.notifications.viewAll')}
              <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
