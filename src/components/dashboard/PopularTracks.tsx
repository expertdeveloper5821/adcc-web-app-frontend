import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Star, Slice } from 'lucide-react';
import type { TrackRankedByEvents } from '../../services/dashboardApi';

const RANK_COLORS = ['#C12D32', '#CF9F0C', '#E1C06E', '#ECC180'];

interface PopularTracksProps {
  tracksRankedByEvents?: TrackRankedByEvents[];
  loading?: boolean;
}

function resolveTrackTitle(track: TrackRankedByEvents['track'], lang: string): string {
  if (lang === 'ar' && track.titleAr) return track.titleAr;
  return track.title || '—';
}

function resolveLocation(track: TrackRankedByEvents['track']): string {
  const parts = [track.city, track.area].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return track.country || '—';
}

export function PopularTracks({ tracksRankedByEvents, loading }: PopularTracksProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const rows = useMemo(() => {
    if (!tracksRankedByEvents?.length) return [];
    return tracksRankedByEvents.filter((item) => item?.track);
  }, [tracksRankedByEvents]);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.popularTracks')}</h2>
        <button
          type="button"
          onClick={() => navigate('/tracks')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm" style={{ color: '#666' }}>
          {t('common.loading')}
        </div>
      ) : (
      <div className="space-y-3">
        {!rows.length ? (
          <div className="text-center py-8 text-sm" style={{ color: '#666' }}>
            {t('common.noResults')}
          </div>
        ) : (
       rows.slice(0, 5).map((item, index) => {
          const { track } = item;
          const id = track._id ?? String(index);
          const color = RANK_COLORS[index % RANK_COLORS.length];
          const name = resolveTrackTitle(track, i18n.language);
          const location = resolveLocation(track);
          return (
          <button
            key={id}
            type="button"
            onClick={() => navigate('/tracks')}
            className="w-full p-4 rounded-xl transition-all hover:shadow-md text-left"
            style={{ backgroundColor: '#FFF9EF' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm mb-1" style={{ color: '#333' }}>{name}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#999' }}>
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pl-11">
              <div className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
                <Users className="w-3 h-3" />
                <span>{t('dashboard.trackEventsCount', { count: item.eventCount })}</span>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
                <Star className="w-3 h-3 fill-current" style={{ color: '#CF9F0C' }} />
                <span>0</span>
              </div>
            </div>
          </button>
          );
        })
        )}
      </div>
      )}
    </div>
  );
}
