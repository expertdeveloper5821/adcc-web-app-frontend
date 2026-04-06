import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, AlertCircle, UserX, Flag } from 'lucide-react';
import { StatCard } from './StatCard';
import {
  getDashboardSummary,
  type DashboardSummaryData,
  type DashboardSummaryModerationQueueItem,
} from '../../services/dashboardApi';

function formatStat(n: number): string {
  return n.toLocaleString();
}

function moderationTypeLabel(type: string, t: (k: string) => string): string {
  const key = `dashboard.moderator.queueType.${type}`;
  const translated = t(key);
  return translated === key ? type.replace(/_/g, ' ') : translated;
}

function queueItemPriority(item: DashboardSummaryModerationQueueItem): 'high' | 'medium' | 'low' {
  const label = (item.statusLabel || '').toLowerCase();
  if (label.includes('report') || label.includes('violation') || label.includes('spam')) {
    return 'high';
  }
  if (label.includes('pending') || label.includes('review')) {
    return 'low';
  }
  return 'medium';
}

export function ModeratorDashboard() {
  const navigate = useNavigate();
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

  const mod = summary?.sections.moderation;
  const queue = mod?.moderationQueue ?? [];

  const pendingCount = useMemo(
    () => (loading ? 0 : (mod?.queueItemsPending ?? queue.length)),
    [loading, mod?.queueItemsPending, queue.length],
  );

  console.log(pendingCount , "pending")

  const highPriorityCount = useMemo(
    () => queue.filter((item) => queueItemPriority(item) === 'high').length,
    [queue],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.moderator.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.moderator.subtitle')}</p>
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
          label={t('dashboard.moderator.pendingPosts')}
          value={loading ? '—' : formatStat(mod?.pendingPosts ?? 0)}
          icon={<MessageSquare className="w-6 h-6" />}
          onClick={() => navigate('/feed')}
        />
        <StatCard
          label={t('dashboard.moderator.reportedContent')}
          value={loading ? '—' : formatStat(mod?.reportedContent ?? 0)}
          icon={<Flag className="w-6 h-6" />}
          onClick={() => navigate('/feed')}
        />
        <StatCard
          label={t('dashboard.moderator.marketplaceQueue')}
          value={loading ? '—' : formatStat(mod?.marketplaceQueue ?? 0)}
          icon={<ShoppingBag className="w-6 h-6" />}
          onClick={() => navigate('/marketplace')}
        />
        <StatCard
          label={t('dashboard.moderator.userReports')}
          value={loading ? '—' : formatStat(mod?.userReports ?? 0)}
          icon={<UserX className="w-6 h-6" />}
          onClick={() => navigate('/users')}
        />
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.moderator.moderationQueue')}</h2>
          <div className="text-sm" style={{ color: '#666' }}>
            {loading ? '—' : t('dashboard.moderator.itemsPending', { count: pendingCount })}
          </div>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-sm" style={{ color: '#666' }}>—</div>
          )}
          {!loading && !queue.length && (
            <div className="text-sm" style={{ color: '#666' }}>{t('common.noResults')}</div>
          )}
          {!loading &&
            queue.map((item) => {
              const priority = queueItemPriority(item);
              const titleLine = item.title
                ? item.title
                : moderationTypeLabel(item.type, t);
              const created = item.createdAt
                ? new Date(item.createdAt).toLocaleString(i18n.language)
                : '';
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border-l-4 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: '#FFF9EF',
                    borderLeftColor: priority === 'high' ? '#C12D32' : priority === 'medium' ? '#CF9F0C' : '#999',
                  }}
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-sm" style={{ color: '#333' }}>{titleLine}</div>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                        {item.userName}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: '#666' }}>{item.statusLabel}</div>
                  </div>
                  {created ? (
                    <div className="text-xs mb-2" style={{ color: '#999' }}>{created}</div>
                  ) : null}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="px-3 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: '#CF9F0C' }}
                    >
                      {t('common.approve')}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      {t('common.reject')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(item.type === 'user' ? '/users' : '/feed')}
                      className="px-3 py-1 rounded text-xs"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      {t('dashboard.moderator.review')}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* High priority alert */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#C12D32' }}>
          <div className="flex items-start gap-3 text-white">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <div className="mb-2">{t('dashboard.moderator.highPriority')}</div>
              <div className="text-sm opacity-90">
                {loading
                  ? '—'
                  : t('dashboard.moderator.requiresAttentionDynamic', {
                      count: highPriorityCount,
                      total: pendingCount,
                    })}
              </div>
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="mt-3 px-4 py-2 rounded-lg bg-white text-sm"
                style={{ color: '#C12D32' }}
              >
                {t('dashboard.moderator.reviewNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
