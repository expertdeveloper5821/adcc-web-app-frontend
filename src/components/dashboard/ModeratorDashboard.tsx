import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, AlertCircle, UserX, Flag } from 'lucide-react';
import { StatCard } from './StatCard';

interface ModeratorDashboardProps {
  navigate: (page: string, params?: any) => void;
}

export function ModeratorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queue = [
    { type: 'Feed Post', user: 'Mohammed Ali', reason: 'Pending Review', priority: 'low' },
    { type: 'Marketplace Item', user: 'Sara Ahmed', reason: 'Reported: Spam', priority: 'high' },
    { type: 'Feed Post', user: 'Omar Hassan', reason: 'Reported: Inappropriate', priority: 'high' },
    { type: 'User Report', user: 'Ahmed Khalid', reason: 'Multiple Violations', priority: 'medium' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.moderator.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.moderator.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.moderator.pendingPosts')}
          value="12"
          icon={<MessageSquare className="w-6 h-6" />}
          onClick={() => navigate('/feed')}
        />
        <StatCard
          label={t('dashboard.moderator.reportedContent')}
          value="8"
          icon={<Flag className="w-6 h-6" />}
          onClick={() => navigate('/feed')}
        />
        <StatCard
          label={t('dashboard.moderator.marketplaceQueue')}
          value="5"
          icon={<ShoppingBag className="w-6 h-6" />}
          onClick={() => navigate('marketplace')}
        />
        <StatCard
          label={t('dashboard.moderator.userReports')}
          value="3"
          icon={<UserX className="w-6 h-6" />}
          onClick={() => navigate('/users')}
        />
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.moderator.moderationQueue')}</h2>
          <div className="text-sm" style={{ color: '#666' }}>
            {t('dashboard.moderator.itemsPending', { count: queue.length })}
          </div>
        </div>

        <div className="space-y-3">
          {queue.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border-l-4 transition-all hover:shadow-md"
              style={{
                backgroundColor: '#FFF9EF',
                borderLeftColor: item.priority === 'high' ? '#C12D32' : item.priority === 'medium' ? '#CF9F0C' : '#999',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-sm" style={{ color: '#333' }}>{item.type}</div>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                    {item.user}
                  </span>
                </div>
                <div className="text-xs" style={{ color: '#666' }}>{item.reason}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: '#CF9F0C' }}>
                  {t('common.approve')}
                </button>
                <button className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: '#C12D32' }}>
                  {t('common.reject')}
                </button>
                <button className="px-3 py-1 rounded text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                  {t('dashboard.moderator.review')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('dashboard.moderator.todaysActivity')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.approved')}</span>
              <span className="text-sm" style={{ color: '#333' }}>24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.rejected')}</span>
              <span className="text-sm" style={{ color: '#333' }}>7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.bannedUsers')}</span>
              <span className="text-sm" style={{ color: '#333' }}>2</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('dashboard.moderator.responseTime')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.average')}</span>
              <span className="text-sm" style={{ color: '#333' }}>12 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.fastest')}</span>
              <span className="text-sm" style={{ color: '#333' }}>3 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#666' }}>{t('dashboard.moderator.target')}</span>
              <span className="text-sm" style={{ color: '#333' }}>15 min</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#C12D32' }}>
          <div className="flex items-start gap-3 text-white">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <div className="mb-2">{t('dashboard.moderator.highPriority')}</div>
              <div className="text-sm opacity-90">
                {t('dashboard.moderator.requiresAttention')}
              </div>
              <button
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
