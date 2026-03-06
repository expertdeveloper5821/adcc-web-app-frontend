import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

export function CommunityManagerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const chapters = [
    { name: 'Abu Dhabi Chapter', members: 3420, growth: '+12%', events: 18 },
    { name: 'Dubai Chapter', members: 2890, growth: '+8%', events: 15 },
    { name: 'Al Ain Chapter', members: 1240, growth: '+15%', events: 9 },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{t('dashboard.communityManager.title')}</h1>
        <p style={{ color: '#666' }}>{t('dashboard.communityManager.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.communityManager.totalMembers')}
          value="7,550"
          icon={<Users className="w-6 h-6" />}
          trend="+11%"
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.activeChapters')}
          value="28"
          icon={<MapPin className="w-6 h-6" />}
          trend="+3"
          onClick={() => navigate('/communities')}
        />
        <StatCard
          label={t('dashboard.communityManager.upcomingEvents')}
          value="47"
          icon={<Calendar className="w-6 h-6" />}
          trend="+23%"
          onClick={() => navigate('/events')}
        />
        <StatCard
          label={t('dashboard.communityManager.monthlyGrowth')}
          value="12.4%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+2.1%"
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
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.upcomingEvents')}</h2>
          <div className="space-y-3">
            {[
              { name: 'Al Wathba Morning Ride', date: 'Jan 15', chapter: 'Abu Dhabi', registrations: 124 },
              { name: 'Yas Island Sprint', date: 'Jan 18', chapter: 'Abu Dhabi', registrations: 89 },
              { name: 'Desert Adventure', date: 'Jan 22', chapter: 'Al Ain', registrations: 67 },
            ].map((event, index) => (
              <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="text-sm mb-1" style={{ color: '#333' }}>{event.name}</div>
                <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
                  <span>{event.date} • {event.chapter}</span>
                  <span>{event.registrations} {t('dashboard.communityManager.registered')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityManager.communityEngagement')}</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#ECC180' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>4.8</div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.avgEventRating')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#E1C06E' }}>
              <div className="text-2xl mb-1" style={{ color: '#333' }}>89%</div>
              <div className="text-sm" style={{ color: '#666' }}>{t('dashboard.communityManager.memberSatisfaction')}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#CF9F0C', color: '#fff' }}>
              <div className="text-2xl mb-1">342</div>
              <div className="text-sm opacity-90">{t('dashboard.communityManager.monthlyActiveMembers')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
