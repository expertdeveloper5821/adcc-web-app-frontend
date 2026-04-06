import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import type { DashboardLandingUpcomingEvent } from '../../services/dashboardApi';

interface UpcomingEventsProps {
  upcomingEvent?: DashboardLandingUpcomingEvent | null;
  loading?: boolean;
}

function formatEventDate(eventDate?: string, eventTime?: string, locale?: string): string {
  if (!eventDate) return '—';
  try {
    const d = new Date(eventDate);
    if (Number.isNaN(d.getTime())) return eventDate;
    const datePart = d.toLocaleDateString(locale || 'en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return eventTime ? `${datePart} ${eventTime}` : datePart;
  } catch {
    return eventDate;
  }
}

function resolveTrackName(event: DashboardLandingUpcomingEvent): string {
  if (event.trackName) return event.trackName;
  if (event.track && typeof event.track === 'object') {
    return event.track.name || event.track.title || '—';
  }
  if (typeof event.track === 'string') return event.track;
  return '—';
}

export function UpcomingEvents({ upcomingEvent, loading }: UpcomingEventsProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const row = useMemo(() => {
    if (!upcomingEvent) return null;
    const id = String(upcomingEvent._id ?? upcomingEvent.id ?? '');
    const title = upcomingEvent.title || upcomingEvent.name || '—';
    const image =
      upcomingEvent.mainImage ||
      upcomingEvent.eventImage ||
      'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=400';
    const max = upcomingEvent.maxParticipants ?? 0;
    const regs = upcomingEvent.registrations ?? 0;
    return {
      id,
      name: title,
      city: upcomingEvent.city || '—',
      date: formatEventDate(upcomingEvent.eventDate, upcomingEvent.eventTime, i18n.language),
      track: resolveTrackName(upcomingEvent),
      registrations: regs,
      capacity: max,
      rating: upcomingEvent.rating,
      image,
    };
  }, [upcomingEvent, i18n.language]);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.upcomingEvents')}</h2>
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.event')}</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.city')}</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.date')}</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.track')}</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.registrations')}</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>{t('dashboard.rating')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm" style={{ color: '#666' }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : !row ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm" style={{ color: '#666' }}>
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              <tr
                onClick={() => row.id && navigate(`/events/${row.id}`)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={row.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-sm" style={{ color: '#333' }}>{row.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{row.city}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{row.date}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{row.track}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>
                      {row.capacity > 0 ? `${row.registrations}/${row.capacity}` : String(row.registrations)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" style={{ color: '#CF9F0C' }} />
                    <span className="text-sm" style={{ color: '#333' }}>
                      {row.rating != null ? row.rating : '—'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
