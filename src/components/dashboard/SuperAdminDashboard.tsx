import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Building2, MapPin } from 'lucide-react';
import { StatCard } from './StatCard';
import { UpcomingEvents } from './UpcomingEvents';
import { PendingApprovals } from './PendingApprovals';
import { CommunityGrowth } from './CommunityGrowth';
import { RecentActivity } from './RecentActivity';
import { PushPerformance } from './PushPerformance';
import { PopularTracks } from './PopularTracks';
import { getDashboardLanding, type DashboardLandingData } from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [landing, setLanding] = useState<DashboardLandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardLanding();
      setLanding(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.noResults'));
      setLanding(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = landing?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.welcome')}</p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: '#FFF3F3', color: '#C12D32' }}
        >
          {error}
        </div>
      )}

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label={t('dashboard.totalUsers')}
          value={loading ? '—' : formatStat(stats?.totalUsers ?? 0)}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/users')}
        />
        <StatCard
          label={t('dashboard.activeUsers')}
          value={loading ? '—' : formatStat(stats?.activeUsers ?? 0)}
          icon={<UserCheck className="w-6 h-6" />}
          onClick={() => navigate('/users')}
        />
        <StatCard
          label={t('dashboard.eventsThisMonth')}
          value={loading ? '—' : formatStat(stats?.eventsThisMonth ?? 0)}
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.activeTracks')}
          value={loading ? '—' : formatStat(stats?.activeTracks ?? 0)}
          icon={<MapPin className="w-6 h-6" />}
          onClick={() => navigate('/tracks')}
        />
        <StatCard
          label={t('dashboard.communities')}
          value={loading ? '—' : formatStat(stats?.activeCommunities ?? 0)}
          icon={<Building2 className="w-6 h-6" />}
          onClick={() => navigate('/communities')}
        />
      </div>

      {/* Row 2: Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents loading={loading} upcomingEvent={landing?.upcomingEvent ?? null} />
        </div>
        <PendingApprovals
          pendingFeedPosts={stats?.pendingFeedPosts}
          pendingStoreItems={stats?.pendingStoreItems}
          reportedFeedPosts={stats?.reportedFeedPosts}
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityGrowth
          loading={loading}
          series={landing?.communityStatsByMonth?.series}
        />
        <PushPerformance />
      </div>

      {/* Row 4: Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <PopularTracks
          loading={loading}
          tracksRankedByEvents={landing?.tracksRankedByEvents}
        />
      </div>
    </div>
  );
}
