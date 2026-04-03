import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CommunityStatsMonthPoint } from '../../services/dashboardApi';

interface CommunityGrowthProps {
  series?: CommunityStatsMonthPoint[];
  loading?: boolean;
}

export function CommunityGrowth({ series, loading }: CommunityGrowthProps) {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(() => {
    if (!series?.length) return [];
    return series.map((point) => ({
      month: new Date(2000, point.month - 1, 1).toLocaleString(i18n.language, { month: 'short' }),
      members: point.count,
    }));
  }, [series, i18n.language]);

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('dashboard.communityGrowth')}</h2>
      {loading ? (
        <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: '#666' }}>
          {t('common.loading')}
        </div>
      ) : !chartData.length ? (
        <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: '#666' }}>
          {t('common.noResults')}
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
          <YAxis tick={{ fill: '#666', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF9EF',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          />
          <Bar dataKey="members" fill="#C12D32" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
