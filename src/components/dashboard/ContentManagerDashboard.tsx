import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, ShoppingBag, Image } from 'lucide-react';
import { StatCard } from './StatCard';
import {
  getDashboardSummary,
  type DashboardSummaryData,
} from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

export function ContentManagerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const content = summary?.sections.content;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.contentManager.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.contentManager.subtitle')}</p>
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
          label={t('dashboard.contentManager.activeBanners')}
          value={loading ? '—' : formatStat(content?.activeBanners ?? 0)}
          icon={<Image className="w-6 h-6" />}
          onClick={() => navigate('/cms')}
        />
        <StatCard
          label={t('dashboard.contentManager.eventsPromoted')}
          value={loading ? '—' : formatStat(content?.eventsPromoted ?? 0)}
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.contentManager.feedPosts')}
          value={loading ? '—' : formatStat(content?.feedPosts ?? 0)}
          icon={<MessageSquare className="w-6 h-6" />}
          onClick={() => navigate('/feed')}
        />
        <StatCard
          label={t('dashboard.contentManager.featuredItems')}
          value={loading ? '—' : formatStat(content?.featuredStoreItems ?? 0)}
          icon={<ShoppingBag className="w-6 h-6" />}
          onClick={() => navigate('/marketplace')}
        />
      </div>

      {/* Homepage Banners summary */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.contentManager.homepageBanners')}</h2>
          <button
            onClick={() => navigate('/cms')}
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: '#C12D32' }}
          >
            {t('dashboard.contentManager.manageContent')}
          </button>
        </div>

        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
          <p className="text-sm" style={{ color: '#666' }}>
            {loading
              ? '—'
              : "no data found"}
          </p>
        </div>
      </div>

      {/* Event promotions & feed (summary counts from API) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.contentManager.eventPromotions')}</h2>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="text-sm mb-2" style={{ color: '#333' }}>
              {/* {loading ? '—' : t('dashboard.contentManager.eventsPromotedCount', { count: content?.eventsPromoted ?? 0 })} */}
             
            </div>
            {/* <button
              type="button"
              onClick={() => navigate('/events')}
              className="text-xs hover:underline"
              style={{ color: '#C12D32' }}
            >
              {t('dashboard.viewAll')}
            </button> */}
             <p>no data found</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.contentManager.feedEngagement')}</h2>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
            {/* <div className="text-sm mb-2" style={{ color: '#333' }}>
              {loading ? '—' : t('dashboard.contentManager.feedPostsCount', { count: content?.feedPosts ?? 0 })}
            </div>
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="text-xs hover:underline"
              style={{ color: '#C12D32' }}
            >
              {t('dashboard.viewAll')}
            </button> */}
            <p>no data found</p>

          </div>
        </div>
      </div>
    </div>
  );
}
