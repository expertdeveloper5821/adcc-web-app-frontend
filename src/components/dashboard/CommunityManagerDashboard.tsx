import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import {
  getDashboardSummary,
  type DashboardSummaryData,
} from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

function formatGrowthPercent(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n}%`;
}

export function CommunityManagerDashboard() {
  const navigate = useNavigate();

  const chapters = [
    // { name: 'Abu Dhabi Chapter', members: 3420, growth: '+12%', events: 18 },
    // { name: 'Dubai Chapter', members: 2890, growth: '+8%', events: 15 },
    // { name: 'Al Ain Chapter', members: 1240, growth: '+15%', events: 9 },
  ];

  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.noResults'));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const community = summary?.sections.community;
  const engagement = community?.communityEngagement;

  const overviewRows = community
    ? [
        {
          label: t('dashboard.communityManager.totalCommunities'),
          value: formatStat(community.totalCommunities),
          sub: t('dashboard.communityManager.featuredCommunities'),
          subVal: formatStat(community.featuredCommunities),
        },
        {
          label: t('dashboard.communityManager.activeCommunitiesLabel'),
          value: formatStat(community.activeCommunities),
          sub: t('dashboard.communityManager.openEvents'),
          subVal: formatStat(community.openEventsCount),
        },
        {
          label: t('dashboard.communityManager.featuredEvents'),
          value: formatStat(community.featuredEventsCount),
          sub: t('dashboard.communityManager.upcomingEvents'),
          subVal: formatStat(community.upcomingEventsCount),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.communityManager.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.communityManager.subtitle')}</p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: '#FFF3F3', color: '#C12D32' }}
        >
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.communityManager.totalMembers')}
          value={loading ? '—' : formatStat(community?.totalMembers ?? 0)}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.activeChapters')}
          value={loading ? '—' : formatStat( 0)}
          icon={<MapPin className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.upcomingEvents')}
          value={loading ? '—' : formatStat(community?.upcomingEventsCount ?? 0)}
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.communityManager.monthlyGrowth')}
          value={loading ? '—' : (community ? formatGrowthPercent(community.monthlyGrowthPercent) : '0%')}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Chapter Growth */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.communityManager.chapterPerformance')}</h2>
          <button
            onClick={() => navigate('/communities')}
            className="text-sm hover:underline"
            style={{ color: '#C12D32' }}
          >
            {t('dashboard.viewAll')}
          </button>
        </div>

        <div className="space-y-4">
           {/* { chapters? (
          {chapters.map((chapter, index) => (
            <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm mb-1" style={{ color: '#333' }}>{chapter.name}</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
                    <Users className="w-3 h-3" />
                    <span>{chapter.members.toLocaleString()} {t('dashboard.communityManager.members')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm mb-1" style={{ color: '#C12D32' }}>{chapter.growth}</div>
                  <div className="text-xs" style={{ color: '#666' }}>{chapter.events} {t('dashboard.communityManager.events')}</div>
                </div>
              </div>
            </div>
          ))}) :<p>no data found</p> } */}
          <p>no data found</p> 
        </div>
      </div>

      {/* Upcoming Events + Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.upcomingEvents')}</h2>
          <div className="space-y-3">
            {loading && (
              <div className="text-sm" style={{ color: '#666' }}>—</div>
            )}
            {!loading && (!community?.upcomingEvents?.length) && (
              <div className="text-sm" style={{ color: '#666' }}>{t('common.noResults')}</div>
            )}
            {!loading &&
              community?.upcomingEvents?.map((event) => {
                const date = event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString(i18n.language, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';
                return (
                  <div key={event.id} className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                    <div className="text-sm mb-1" style={{ color: '#333' }}>{event.title}</div>
                    <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
                      <span>{date} • {event.city}{event.trackTitle ? ` • ${event.trackTitle}` : ''}</span>
                      <span>
                        {formatStat(event.registeredCount)} {t('dashboard.communityManager.registered')}
                        {event.maxParticipants != null ? ` / ${formatStat(event.maxParticipants)}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.communityEngagement')}</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#ECC180' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>
                {loading ? '—' : engagement?.averageEventRating != null ? String(engagement.averageEventRating) : '—'}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.avgEventRating')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#E1C06E' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>
                {loading
                  ? '—'
                  : engagement?.memberSatisfactionPercent != null
                    ? `${engagement.memberSatisfactionPercent}%`
                    : '—'}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.memberSatisfaction')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#CF9F0C', color: '#fff' }}>
              <div className="text-2xl mb-1">
                {loading ? '—' : formatStat(engagement?.monthlyActiveMembers ?? 0)}
              </div>
              <div className="text-sm opacity-90">{t('dashboard.communityManager.monthlyActiveMembers')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
